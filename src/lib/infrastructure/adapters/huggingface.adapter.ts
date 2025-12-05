/**
 * Adaptateur Hugging Face utilisant le SDK OpenAI
 * Utilise l'endpoint router.huggingface.co/v1
 */

import { OpenAI } from "openai";
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
  private client: OpenAI | null = null;
  private apiKey: string;
  private modelId: string;

  constructor(config: HuggingFaceConfig) {
    this.apiKey = config.apiKey;
    this.modelId = config.modelId;
    this.initClient();
  }

  private initClient(): void {
    if (this.apiKey) {
      this.client = new OpenAI({
        baseURL: "https://router.huggingface.co/v1",
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true,
      });
    }
  }

  setModel(modelId: string): void {
    this.modelId = modelId;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.initClient();
  }

  async sendMessage(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<string> {
    if (!this.client || !this.apiKey) {
      throw new Error("Cle API Hugging Face non configuree");
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const chatCompletion = await this.client.chat.completions.create({
      model: this.modelId,
      messages: formattedMessages,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature || 0.7,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Reponse vide de l'API");
    }

    return content.trim();
  }

  async streamMessage(
    messages: Message[],
    options?: ChatCompletionOptions,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    if (!this.client || !this.apiKey) {
      throw new Error("Cle API Hugging Face non configuree");
    }

    const formattedMessages = messages.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    const stream = await this.client.chat.completions.create({
      model: this.modelId,
      messages: formattedMessages,
      max_tokens: options?.maxTokens || 1024,
      temperature: options?.temperature || 0.7,
      stream: true,
    });

    let fullContent = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        onChunk?.(content);
      }
    }

    return fullContent;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.client || !this.apiKey) return false;

    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
}
