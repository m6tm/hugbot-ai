/**
 * Store Svelte pour gerer l'etat du chat
 */

import { writable, derived, get } from "svelte/store";
import type { Conversation } from "$lib/domain/entities/conversation";
import type { Message } from "$lib/domain/entities/message";
import type { ChatServicePort } from "$lib/domain/ports/chat-service.port";
import { ChatUseCase } from "$lib/application/use-cases/chat.use-case";
import { DexieStorageAdapter } from "$lib/infrastructure/adapters/dexie-storage.adapter";
import { MockChatAdapter } from "$lib/infrastructure/adapters/mock-chat.adapter";
import { HuggingFaceAdapter } from "$lib/infrastructure/adapters/huggingface.adapter";
import { settingsStore } from "./settings.store";
import { integrationsStore } from "./integrations.store";
import { getModelById } from "$lib/config/models";
import { telegramService } from "$lib/services/telegram.service";

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

const initialState: ChatState = {
  conversations: [],
  currentConversationId: null,
  isLoading: false,
  isStreaming: false,
  streamingContent: "",
  error: null,
};

function createChatStore() {
  const { subscribe, set, update } = writable<ChatState>(initialState);

  const storage = new DexieStorageAdapter();
  const mockAdapter = new MockChatAdapter();
  const huggingFaceAdapter = new HuggingFaceAdapter({
    apiKey: "",
    modelId: "",
  });

  /**
   * Recupere le bon adaptateur selon les parametres
   */
  function getChatService(): ChatServicePort {
    const settings = get(settingsStore);
    const model = getModelById(settings.currentModelId);

    if (!model || model.provider === "mock") {
      return mockAdapter;
    }

    if (model.provider === "huggingface") {
      huggingFaceAdapter.setApiKey(settings.apiKey);
      huggingFaceAdapter.setModel(model.modelId);
      return huggingFaceAdapter;
    }

    return mockAdapter;
  }

  /**
   * Cree un ChatUseCase avec le bon service
   */
  function createUseCase(): ChatUseCase {
    return new ChatUseCase(storage, getChatService());
  }

  return {
    subscribe,

    /**
     * Initialise le store avec les conversations existantes
     */
    async init() {
      update((state) => ({ ...state, isLoading: true }));
      try {
        const chatUseCase = createUseCase();
        const conversations = await chatUseCase.getConversations();
        update((state) => ({
          ...state,
          conversations,
          isLoading: false,
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: (error as Error).message,
          isLoading: false,
        }));
      }
    },

    /**
     * Cree une nouvelle conversation
     */
    async createConversation() {
      try {
        const chatUseCase = createUseCase();
        const conversation = await chatUseCase.createNewConversation();
        update((state) => ({
          ...state,
          conversations: [conversation, ...state.conversations],
          currentConversationId: conversation.id,
        }));
        return conversation;
      } catch (error) {
        update((state) => ({
          ...state,
          error: (error as Error).message,
        }));
        return null;
      }
    },

    /**
     * Selectionne une conversation
     */
    selectConversation(id: string) {
      update((state) => ({
        ...state,
        currentConversationId: id,
      }));
    },

    /**
     * Supprime une conversation
     */
    async deleteConversation(id: string) {
      try {
        const chatUseCase = createUseCase();
        await chatUseCase.deleteConversation(id);
        update((state) => {
          const newConversations = state.conversations.filter(
            (c) => c.id !== id,
          );
          return {
            ...state,
            conversations: newConversations,
            currentConversationId:
              state.currentConversationId === id
                ? newConversations[0]?.id || null
                : state.currentConversationId,
          };
        });
      } catch (error) {
        update((state) => ({
          ...state,
          error: (error as Error).message,
        }));
      }
    },

    /**
     * Envoie un message (utilise le modele actuellement selectionne)
     */
    async sendMessage(content: string) {
      const state = get({ subscribe });

      if (!state.currentConversationId) {
        const conversation = await this.createConversation();
        if (!conversation) return;
      }

      const currentState = get({ subscribe });
      const conversationId = currentState.currentConversationId!;
      const conversation = currentState.conversations.find(
        (c) => c.id === conversationId,
      );

      if (!conversation) {
        throw new Error("Conversation introuvable");
      }

      const settings = get(settingsStore);

      update((s) => ({
        ...s,
        isStreaming: true,
        streamingContent: "",
      }));

      try {
        const chatUseCase = createUseCase();
        const { userMessage, assistantMessage } = await chatUseCase.sendMessage(
          conversation,
          content,
          {
            stream: true,
            temperature: settings.temperature,
            maxTokens: settings.maxTokens,
            systemInstruction: settings.systemInstruction,
          },
          (chunk) => {
            update((s) => ({
              ...s,
              streamingContent: s.streamingContent + chunk,
            }));
          },
        );

        update((s) => {
          const conversations = s.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [
                  ...conv.messages.filter(
                    (m) =>
                      m.id !== userMessage.id && m.id !== assistantMessage.id,
                  ),
                  userMessage,
                  assistantMessage,
                ],
                title:
                  conv.messages.length === 0
                    ? content.substring(0, 40)
                    : conv.title,
                updatedAt: new Date(),
              };
            }
            return conv;
          });

          return {
            ...s,
            conversations,
            isStreaming: false,
            streamingContent: "",
          };
        });

        // Envoyer une notification Telegram si configurée
        try {
          const integrations = get(integrationsStore);
          if (integrations.telegram.enabled) {
            await telegramService.updateConfig(integrations.telegram);
            await telegramService.notifyNewMessage(
              content,
              assistantMessage.content,
            );
          }
        } catch (telegramError) {
          console.warn(
            "Erreur lors de l'envoi de notification Telegram:",
            telegramError,
          );
        }
      } catch (error) {
        update((s) => ({
          ...s,
          error: (error as Error).message,
          isStreaming: false,
          streamingContent: "",
        }));

        // Envoyer une notification d'erreur Telegram si configurée
        try {
          const integrations = get(integrationsStore);
          if (
            integrations.telegram.enabled &&
            integrations.telegram.sendOnError
          ) {
            await telegramService.updateConfig(integrations.telegram);
            await telegramService.notifyError(
              (error as Error).message,
              "Envoi de message",
            );
          }
        } catch (telegramError) {
          console.warn(
            "Erreur lors de l'envoi de notification d'erreur Telegram:",
            telegramError,
          );
        }
      }
    },

    /**
     * Renomme une conversation
     */
    async renameConversation(id: string, newTitle: string) {
      try {
        const chatUseCase = createUseCase();
        await chatUseCase.renameConversation(id, newTitle);
        update((state) => ({
          ...state,
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title: newTitle } : conv,
          ),
        }));
      } catch (error) {
        update((state) => ({
          ...state,
          error: (error as Error).message,
        }));
      }
    },

    /**
     * Efface l'erreur
     */
    clearError() {
      update((state) => ({ ...state, error: null }));
    },

    /**
     * Reset le store
     */
    reset() {
      set(initialState);
    },
  };
}

export const chatStore = createChatStore();

export const currentConversation = derived(chatStore, ($store) => {
  if (!$store.currentConversationId) return null;
  return (
    $store.conversations.find((c) => c.id === $store.currentConversationId) ||
    null
  );
});

export const currentMessages = derived(currentConversation, ($conversation) => {
  return $conversation?.messages || [];
});
