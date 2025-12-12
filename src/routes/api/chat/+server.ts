/**
 * Route API pour le chat avec Hugging Face
 * Supporte le streaming avec Server-Sent Events (SSE)
 * Inclut la gestion des limites pour les utilisateurs non connectés
 */

import { OpenAI } from "openai";
import { env } from "$env/dynamic/private";
import {
	canGuestSendMessage,
	incrementGuestMessageCount,
} from "$lib/infrastructure/services/guestLimit.service";
import { decrypt } from "$lib/server/crypto";
import { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";

interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

interface ChatRequest {
	messages: ChatMessage[];
	modelId: string;
	temperature?: number;
	maxTokens?: number;
	apiKey?: string;
	stream?: boolean;
	fingerprint?: string;
	conversationId?: string;
}

/**
 * Extrait l'adresse IP du client depuis les headers de la requête
 */
function getClientIp(request: Request): string {
	const forwardedFor = request.headers.get("x-forwarded-for");
	if (forwardedFor) {
		return forwardedFor.split(",")[0].trim();
	}

	const realIp = request.headers.get("x-real-ip");
	if (realIp) {
		return realIp;
	}

	return "unknown";
}

/**
 * Génère un identifiant unique combinant IP et fingerprint
 */
function generateGuestId(ip: string, fingerprint?: string): string {
	if (fingerprint) {
		return `${ip}:${fingerprint}`;
	}
	return ip;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body: ChatRequest = await request.json();

		const { session, user } = await locals.safeGetSession();

		if (!session) {
			const clientIp = getClientIp(request);
			const guestId = generateGuestId(clientIp, body.fingerprint);

			const canSend = await canGuestSendMessage(guestId);
			if (!canSend) {
				return new Response(
					JSON.stringify({
						error: "GUEST_LIMIT_REACHED",
						message:
							"Vous avez atteint la limite journalière de messages. Connectez-vous pour continuer à discuter sans restriction.",
					}),
					{
						status: 429,
						headers: { "Content-Type": "application/json" },
					},
				);
			}

			await incrementGuestMessageCount(guestId);
		}

		const {
			messages,
			modelId,
			temperature = 0.7,
			maxTokens = 1024,
			apiKey,
			stream = false,
			conversationId,
		} = body;

		// Utilise la cle de l'utilisateur si fournie, sinon celle en BDD ou celle du serveur
		let effectiveApiKey = apiKey;

		// Si connecte, recuperer la cle chiffrée ou utiliser la clé fournie
		if (user && !effectiveApiKey) {
			const userData = await db.user.findUnique({
				where: { id: user.id },
				select: { huggingFaceKey: true },
			});

			if (userData?.huggingFaceKey) {
				try {
					effectiveApiKey = decrypt(userData.huggingFaceKey);
				} catch (e) {
					console.error("Failed to decrypt user key", e);
				}
			}
		}

		// Fallback serveur
		if (!effectiveApiKey) {
			effectiveApiKey = env.HUGGINGFACE_API_KEY;
		}

		if (!effectiveApiKey) {
			return new Response(
				JSON.stringify({
					error:
						"Aucune cle API configuree. Veuillez configurer votre cle dans les parametres.",
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Gestion de la persistence (seulement si connecte)
		let currentConversationId = conversationId;
		if (session && user) {
			if (!currentConversationId) {
				// Nouvelle conversation
				const title =
					messages[0]?.content.slice(0, 50) || "Nouvelle conversation";
				const conv = await db.conversation.create({
					data: {
						userId: user.id,
						title: title,
					},
				});
				currentConversationId = conv.id;
			}

			// Sauvegarder le message utilisateur
			const lastMessage = messages[messages.length - 1];
			if (lastMessage && lastMessage.role === "user" && currentConversationId) {
				await db.message.create({
					data: {
						conversationId: currentConversationId,
						role: "user",
						content: lastMessage.content,
					},
				});
			}
		}

		const client = new OpenAI({
			baseURL: "https://router.huggingface.co/v1",
			apiKey: effectiveApiKey,
		});

		const formattedMessages = messages.map((m) => ({
			role: m.role,
			content: m.content,
		}));

		// Mode streaming avec SSE
		if (stream) {
			const streamResponse = await client.chat.completions.create({
				model: modelId,
				messages: formattedMessages,
				max_tokens: maxTokens,
				temperature: temperature,
				stream: true,
			});

			const encoder = new TextEncoder();
			let accumulatedContent = "";

			const readableStream = new ReadableStream({
				async start(controller) {
					try {
						for await (const chunk of streamResponse) {
							const content = chunk.choices[0]?.delta?.content;
							if (content) {
								accumulatedContent += content;
								// Format SSE
								const data = `data: ${JSON.stringify({ content })}\n\n`;
								controller.enqueue(encoder.encode(data));
							}
						}

						// Sauvegarde de la reponse assistant si connecte
						if (
							session &&
							user &&
							currentConversationId &&
							accumulatedContent
						) {
							await db.message.create({
								data: {
									conversationId: currentConversationId,
									role: "assistant",
									content: accumulatedContent,
								},
							});
						}

						// Signal de fin
						controller.enqueue(encoder.encode("data: [DONE]\n\n"));
						controller.close();
					} catch (error) {
						const errorData = `data: ${JSON.stringify({
							error: (error as Error).message,
						})}\n\n`;
						controller.enqueue(encoder.encode(errorData));
						controller.close();
					}
				},
			});

			return new Response(readableStream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
					// Send conversation ID in header for client to update URL if needed
					"X-Conversation-Id": currentConversationId || "",
				},
			});
		}

		// Mode non-streaming
		const chatCompletion = await client.chat.completions.create({
			model: modelId,
			messages: formattedMessages,
			max_tokens: maxTokens,
			temperature: temperature,
		});

		const content = chatCompletion.choices[0]?.message?.content;

		if (!content) {
			return new Response(JSON.stringify({ error: "Reponse vide de l'API" }), {
				status: 500,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Sauvegarder reponse en non-streaming
		if (session && user && currentConversationId) {
			await db.message.create({
				data: {
					conversationId: currentConversationId,
					role: "assistant",
					content: content,
				},
			});
		}

		return new Response(
			JSON.stringify({
				content: content.trim(),
				conversationId: currentConversationId,
			}),
			{
				headers: { "Content-Type": "application/json" },
			},
		);
	} catch (error) {
		console.error("Erreur API Chat:", error);
		return new Response(
			JSON.stringify({
				error:
					(error as Error).message ||
					"Erreur lors de la communication avec l'API",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
};
