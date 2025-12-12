/**
 * Adaptateur Hugging Face
 * Envoie les requetes a la route API serveur
 * Supporte le streaming avec Server-Sent Events (SSE)
 */

import { DEFAULT_SYSTEM_INSTRUCTION } from "$lib/config/default-system-prompt";
import type { Message } from "$lib/domain/entities/message";
import type {
	ChatCompletionOptions,
	ChatServicePort,
} from "$lib/domain/ports/chat-service.port";
import { HttpClientError, httpClient } from "$lib/infrastructure/http";
import { getOrCreateFingerprint } from "$lib/utils/fingerprint";

interface HuggingFaceConfig {
	apiKey?: string;
	modelId: string;
}

interface ApiChatResponse {
	content?: string;
	error?: string;
	message?: string;
}

export class HuggingFaceAdapter implements ChatServicePort {
	private apiKey: string;
	private modelId: string;
	private fingerprint: string | null = null;

	constructor(config: HuggingFaceConfig) {
		this.apiKey = config.apiKey || "";
		this.modelId = config.modelId;
		this.initFingerprint();
	}

	private async initFingerprint(): Promise<void> {
		if (typeof window !== "undefined") {
			this.fingerprint = await getOrCreateFingerprint();
		}
	}

	setModel(modelId: string): void {
		this.modelId = modelId;
	}

	setApiKey(apiKey: string): void {
		this.apiKey = apiKey;
	}

	private formatMessages(messages: Message[], systemInstruction?: string) {
		const formattedMessages = messages.map((m) => ({
			role: m.role as "user" | "assistant" | "system",
			content: m.content,
		}));

		// Combine default instruction with user instruction
		let systemContent = DEFAULT_SYSTEM_INSTRUCTION;
		if (systemInstruction) {
			systemContent += `\n\n${systemInstruction}`;
		}

		formattedMessages.unshift({
			role: "system",
			content: systemContent,
		});

		return formattedMessages;
	}

	/**
	 * Appelle la route API serveur (mode non-streaming)
	 */
	private async callApi(
		messages: Message[],
		options?: ChatCompletionOptions,
	): Promise<string> {
		const formattedMessages = this.formatMessages(
			messages,
			options?.systemInstruction,
		);

		try {
			const { data } = await httpClient.post<ApiChatResponse>("/api/chat", {
				messages: formattedMessages,
				modelId: this.modelId,
				temperature: options?.temperature || 0.7,
				maxTokens: options?.maxTokens || 1024,
				apiKey: this.apiKey || undefined,
				stream: false,
				fingerprint: this.fingerprint || undefined,
			});

			if (data.error) {
				if (data.error === "GUEST_LIMIT_REACHED") {
					throw new Error(
						data.message ||
							"Limite journaliere atteinte. Connectez-vous pour continuer.",
					);
				}
				throw new Error(data.error);
			}

			return data.content || "";
		} catch (error) {
			if (
				error instanceof HttpClientError &&
				error.code === "GUEST_LIMIT_REACHED"
			) {
				throw new Error(
					"Limite journaliere atteinte. Connectez-vous pour continuer.",
				);
			}
			throw error;
		}
	}

	async sendMessage(
		messages: Message[],
		options?: ChatCompletionOptions,
	): Promise<string> {
		return this.callApi(messages, options);
	}

	/**
	 * Streaming avec Server-Sent Events (SSE)
	 */
	async streamMessage(
		messages: Message[],
		options?: ChatCompletionOptions,
		onChunk?: (chunk: string) => void,
	): Promise<string> {
		const formattedMessages = this.formatMessages(
			messages,
			options?.systemInstruction,
		);

		const response = await httpClient.postStream("/api/chat", {
			messages: formattedMessages,
			modelId: this.modelId,
			temperature: options?.temperature || 0.7,
			maxTokens: options?.maxTokens || 1024,
			apiKey: this.apiKey || undefined,
			stream: true,
			fingerprint: this.fingerprint || undefined,
		});

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Impossible de lire le stream");
		}

		const decoder = new TextDecoder();
		let fullContent = "";

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			const text = decoder.decode(value, { stream: true });
			const lines = text.split("\n");

			for (const line of lines) {
				if (line.startsWith("data: ")) {
					const data = line.slice(6);

					if (data === "[DONE]") {
						break;
					}

					try {
						const parsed = JSON.parse(data);
						if (parsed.content) {
							fullContent += parsed.content;
							onChunk?.(parsed.content);
						}
						if (parsed.error) {
							throw new Error(parsed.error);
						}
					} catch {
						// Ignorer les erreurs de parsing (lignes vides, etc.)
					}
				}
			}
		}

		return fullContent;
	}

	async isAvailable(): Promise<boolean> {
		try {
			await httpClient.post("/api/chat", {
				messages: [{ role: "user", content: "test" }],
				modelId: this.modelId,
				maxTokens: 1,
				apiKey: this.apiKey || undefined,
				fingerprint: this.fingerprint || undefined,
			});
			return true;
		} catch {
			return false;
		}
	}
}
