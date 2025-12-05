/**
 * Use case pour gerer les conversations
 */

import type {
  Conversation,
  CreateConversationInput,
} from "$lib/domain/entities/conversation";
import {
  createConversation,
  generateTitle,
} from "$lib/domain/entities/conversation";
import type { Message } from "$lib/domain/entities/message";
import { createMessage } from "$lib/domain/entities/message";
import type { StoragePort } from "$lib/domain/ports/storage.port";
import type {
  ChatServicePort,
  ChatCompletionOptions,
} from "$lib/domain/ports/chat-service.port";

export class ChatUseCase {
  constructor(
    private readonly storage: StoragePort,
    private readonly chatService: ChatServicePort
  ) {}

  /**
   * Cree une nouvelle conversation
   */
  async createNewConversation(
    input?: CreateConversationInput
  ): Promise<Conversation> {
    const conversation = createConversation(input);
    await this.storage.saveConversation(conversation);
    return conversation;
  }

  /**
   * Recupere toutes les conversations
   */
  async getConversations(): Promise<Conversation[]> {
    return this.storage.getAllConversations();
  }

  /**
   * Recupere une conversation par son ID
   */
  async getConversation(id: string): Promise<Conversation | null> {
    return this.storage.getConversation(id);
  }

  /**
   * Supprime une conversation
   */
  async deleteConversation(id: string): Promise<void> {
    await this.storage.deleteConversation(id);
  }

  /**
   * Envoie un message et recoit une reponse
   */
  async sendMessage(
    conversationId: string,
    content: string,
    options?: ChatCompletionOptions,
    onStreamChunk?: (chunk: string) => void
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const conversation = await this.storage.getConversation(conversationId);
    if (!conversation) {
      throw new Error("Conversation non trouvee");
    }

    const userMessage = createMessage({
      conversationId,
      role: "user",
      content,
    });

    conversation.messages.push(userMessage);

    if (conversation.messages.length === 1) {
      conversation.title = generateTitle(content);
    }

    await this.storage.updateConversation(conversation);

    let responseContent: string;

    if (options?.stream && onStreamChunk) {
      responseContent = await this.chatService.streamMessage(
        conversation.messages,
        options,
        onStreamChunk
      );
    } else {
      responseContent = await this.chatService.sendMessage(
        conversation.messages,
        options
      );
    }

    const assistantMessage = createMessage({
      conversationId,
      role: "assistant",
      content: responseContent,
    });

    conversation.messages.push(assistantMessage);
    await this.storage.updateConversation(conversation);

    return { userMessage, assistantMessage };
  }

  /**
   * Renomme une conversation
   */
  async renameConversation(id: string, newTitle: string): Promise<void> {
    const conversation = await this.storage.getConversation(id);
    if (!conversation) {
      throw new Error("Conversation non trouvee");
    }

    conversation.title = newTitle;
    await this.storage.updateConversation(conversation);
  }
}
