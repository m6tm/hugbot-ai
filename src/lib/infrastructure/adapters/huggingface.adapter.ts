/**
 * Adaptateur Hugging Face utilisant le format OpenAI
 * Utilise l'endpoint router.huggingface.co/v1
 */

import type { Message } from "$lib/domain/entities/message";
import type {
  ChatServicePort,
  ChatCompletionOptions,
} from "$lib/domain/ports/chat-service.port";

interface HuggingFaceConfig {
  apiKey: string;
  modelId: string;
}

export class HuggingFaceAdapter implements ChatServicePort {
  private apiKey: string;
  private modelId: string;
  private baseUrl = "https://router.huggingface.co/v1";

  constructor(config: HuggingFaceConfig) {
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
  }

  setModel(modelId: string): void {
    this.modelId = modelId;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  async sendMessage(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Cle API Hugging Face non configuree");
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Erreur API: ${response.status}`);
    }

    const data = await response.json();

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }

    throw new Error("Reponse inattendue de l'API");
  }

  async streamMessage(
    messages: Message[],
    options?: ChatCompletionOptions,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Cle API Hugging Face non configuree");
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.modelId,
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 1024,
        temperature: options?.temperature || 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Erreur API: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";

    if (!reader) {
      throw new Error("Impossible de lire le stream");
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onChunk?.(content);
              }
            } catch {
              // Ignorer les erreurs de parsing
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
