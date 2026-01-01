/**
 * Route API pour le chat avec Hugging Face
 * Supporte le streaming avec Server-Sent Events (SSE)
 * Inclut la gestion des limites pour les utilisateurs non connectés
 *
 * Optimisations :
 * - Sauvegarde non-bloquante en BDD (fire-and-forget)
 * - Historique charge depuis la BDD (pas dans le body de la requete)
 * - Fenetre coulissante pour limiter le contexte envoye a l'IA
 */

import { OpenAI } from "openai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "$lib/config/default-system-prompt";
import {
	canGuestSendMessage,
	incrementGuestMessageCount,
} from "$lib/infrastructure/services/guestLimit.service";
import { getAIConfig } from "$lib/server/ai";
import { decrypt } from "$lib/server/crypto";
import prisma, { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";

interface ChatMessage {
	role: "user" | "assistant" | "system";
	content: string;
}

interface ChatRequest {
	message: string;
	modelId: string;
	temperature?: number;
	maxTokens?: number;
	apiKey?: string;
	stream?: boolean;
	fingerprint?: string;
	conversationId?: string;
	systemInstruction?: string;
}

const MAX_CONTEXT_MESSAGES = 20;

/**
 * Sauvegarde un message en BDD sans bloquer l'execution
 * Met aussi a jour le updatedAt de la conversation via transaction
 */
function saveMessageAsync(
	conversationId: string,
	role: "user" | "assistant",
	content: string,
): void {
	prisma
		.$transaction([
			prisma.message.create({
				data: {
					conversationId,
					role,
					content,
				},
			}),
			prisma.conversation.update({
				where: { id: conversationId },
				data: { updatedAt: new Date() },
			}),
		])
		.catch((error) => {
			console.error(`Erreur sauvegarde message ${role}:`, error);
		});
}

/**
 * Cree une nouvelle conversation en BDD
 */
async function createConversation(
	userId: string,
	title: string,
): Promise<string> {
	const conv = await db.conversation.create({
		data: {
			userId,
			title: title.slice(0, 50),
		},
	});
	return conv.id;
}

/**
 * Charge l'historique des messages depuis la BDD avec une limite
 */
async function loadConversationHistory(
	conversationId: string,
): Promise<ChatMessage[]> {
	const messages = await db.message.findMany({
		where: { conversationId },
		orderBy: { createdAt: "desc" },
		take: MAX_CONTEXT_MESSAGES,
		select: {
			role: true,
			content: true,
		},
	});

	return messages.reverse().map((m) => ({
		role: m.role as "user" | "assistant",
		content: m.content,
	}));
}

/**
 * Extrait l'adresse IP du client depuis les headers de la requete
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
 * Genere un identifiant unique combinant IP et fingerprint
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

			// Increment en arriere-plan
			incrementGuestMessageCount(guestId).catch(console.error);
		}

		const {
			message,
			modelId,
			temperature = 0.7,
			maxTokens = 1024,
			apiKey,
			stream = false,
			conversationId,
			systemInstruction,
		} = body;

		if (!message?.trim()) {
			return new Response(JSON.stringify({ error: "Message vide" }), {
				status: 400,
				headers: { "Content-Type": "application/json" },
			});
		}

		// Recuperation de la cle API utilisateur si presente
		let userApiKey = apiKey;
		if (user && !userApiKey) {
			const setting = await db.setting.findUnique({
				where: { userId: user.id },
				select: { apiKey: true },
			});

			if (setting?.apiKey) {
				try {
					userApiKey = decrypt(setting.apiKey);
				} catch (e) {
					console.error("Failed to decrypt user key", e);
				}
			}
		}

		// Récupération de la configuration AI via l'utilitaire centralisé
		const aiConfig = getAIConfig(modelId, userApiKey);

		if (!aiConfig.apiKey) {
			return new Response(
				JSON.stringify({
					error:
						"Aucune cle API configuree pour ce fournisseur. Veuillez configurer votre cle dans les parametres ou contacter l'administrateur.",
				}),
				{
					status: 401,
					headers: { "Content-Type": "application/json" },
				},
			);
		}

		// Gestion de la conversation (seulement si connecte)
		let currentConversationId = conversationId;
		let conversationHistory: ChatMessage[] = [];

		if (session && user) {
			if (!currentConversationId) {
				// Nouvelle conversation - creation synchrone car on a besoin de l'ID
				currentConversationId = await createConversation(user.id, message);
			} else {
				// Charger l'historique depuis la BDD
				conversationHistory = await loadConversationHistory(
					currentConversationId,
				);
			}

			// Sauvegarder le message utilisateur en arriere-plan
			saveMessageAsync(currentConversationId, "user", message);
		}

		// Construction du contexte pour l'IA
		const messagesForAI: ChatMessage[] = [];

		// Toujours ajouter le prompt systeme par defaut
		// Combine avec l'instruction personnalisee si presente
		let finalSystemContent = DEFAULT_SYSTEM_INSTRUCTION;
		if (systemInstruction?.trim()) {
			finalSystemContent += `\n\n${systemInstruction}`;
		}

		messagesForAI.push({
			role: "system",
			content: finalSystemContent,
		});

		// Ajout de l'historique (deja limite par loadConversationHistory)
		messagesForAI.push(...conversationHistory);

		// Ajout du nouveau message
		messagesForAI.push({
			role: "user",
			content: message,
		});

		const client = new OpenAI({
			baseURL: aiConfig.baseURL || undefined,
			apiKey: aiConfig.apiKey,
		});

		// Mode streaming avec SSE
		if (stream) {
			const streamResponse = await client.chat.completions.create({
				model: modelId,
				messages: messagesForAI,
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
								const data = `data: ${JSON.stringify({ content })}\n\n`;
								controller.enqueue(encoder.encode(data));
							}
						}

						// Sauvegarde non-bloquante de la reponse
						if (
							session &&
							user &&
							currentConversationId &&
							accumulatedContent
						) {
							saveMessageAsync(
								currentConversationId,
								"assistant",
								accumulatedContent,
							);
						}

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
					"X-Conversation-Id": currentConversationId || "",
				},
			});
		}

		// Mode non-streaming
		const chatCompletion = await client.chat.completions.create({
			model: modelId,
			messages: messagesForAI,
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

		// Sauvegarde non-bloquante
		if (session && user && currentConversationId) {
			saveMessageAsync(currentConversationId, "assistant", content);
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
