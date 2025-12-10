/**
 * Route API pour le chat avec Hugging Face
 * Supporte le streaming avec Server-Sent Events (SSE)
 */

import { OpenAI } from "openai";
import { env } from "$env/dynamic/private";
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
}

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body: ChatRequest = await request.json();
		const {
			messages,
			modelId,
			temperature = 0.7,
			maxTokens = 1024,
			apiKey,
			stream = false,
		} = body;

		// Utilise la cle de l'utilisateur si fournie, sinon la cle du serveur
		const effectiveApiKey = apiKey || env.HUGGINGFACE_API_KEY;

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

			const readableStream = new ReadableStream({
				async start(controller) {
					try {
						for await (const chunk of streamResponse) {
							const content = chunk.choices[0]?.delta?.content;
							if (content) {
								// Format SSE
								const data = `data: ${JSON.stringify({ content })}\n\n`;
								controller.enqueue(encoder.encode(data));
							}
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

		return new Response(JSON.stringify({ content: content.trim() }), {
			headers: { "Content-Type": "application/json" },
		});
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
