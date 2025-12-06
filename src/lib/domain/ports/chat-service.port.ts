/**
 * Port pour le service de chat AI
 * Interface que doivent implementer les adaptateurs
 */

import type { Message } from "../entities/message";

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemInstruction?: string;
}

export interface ChatServicePort {
  /**
   * Envoie un message et recoit une reponse
   */
  sendMessage(
    messages: Message[],
    options?: ChatCompletionOptions
  ): Promise<string>;

  /**
   * Envoie un message et recoit une reponse en streaming
   */
  streamMessage(
    messages: Message[],
    options?: ChatCompletionOptions,
    onChunk?: (chunk: string) => void
  ): Promise<string>;

  /**
   * Verifie si le service est disponible
   */
  isAvailable(): Promise<boolean>;
}
