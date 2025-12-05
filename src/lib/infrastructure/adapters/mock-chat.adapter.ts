/**
 * Adaptateur Mock pour le service de chat AI
 * Simule les reponses pour le developpement et les tests
 */

import type { Message } from "$lib/domain/entities/message";
import type {
  ChatServicePort,
  ChatCompletionOptions,
} from "$lib/domain/ports/chat-service.port";

const MOCK_RESPONSES = [
  "Je suis une IA de demonstration. Comment puis-je vous aider aujourd'hui?",
  "C'est une excellente question! Laissez-moi y reflechir...",
  "Voici ce que je peux vous dire a ce sujet: cette fonctionnalite est en cours de developpement.",
  "Je comprends votre demande. Pour l'instant, je fonctionne en mode demonstration.",
  "Interessant! Dans un environnement de production, je serais connecte a un vrai modele de langage.",
  "Merci pour votre message. N'hesitez pas a me poser d'autres questions!",
  "Je suis la pour vous aider. Que souhaitez-vous savoir?",
  "Cette conversation est simulee, mais l'interface est bien reelle!",
];

export class MockChatAdapter implements ChatServicePort {
  private getRandomResponse(): string {
    const index = Math.floor(Math.random() * MOCK_RESPONSES.length);
    return MOCK_RESPONSES[index];
  }

  private async simulateDelay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async sendMessage(
    _messages: Message[],
    _options?: ChatCompletionOptions
  ): Promise<string> {
    await this.simulateDelay(1000);
    return this.getRandomResponse();
  }

  async streamMessage(
    _messages: Message[],
    _options?: ChatCompletionOptions,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const response = this.getRandomResponse();
    const words = response.split(" ");
    let fullResponse = "";

    for (const word of words) {
      await this.simulateDelay(50 + Math.random() * 100);
      const chunk = (fullResponse ? " " : "") + word;
      fullResponse += chunk;
      onChunk?.(chunk);
    }

    return fullResponse;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
