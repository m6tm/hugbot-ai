/**
 * Store Svelte pour gerer l'etat du chat
 */

import { writable, derived, get } from "svelte/store";
import type { Conversation } from "$lib/domain/entities/conversation";
import type { Message } from "$lib/domain/entities/message";
import { ChatUseCase } from "$lib/application/use-cases/chat.use-case";
import { LocalStorageAdapter } from "$lib/infrastructure/adapters/local-storage.adapter";
import { MockChatAdapter } from "$lib/infrastructure/adapters/mock-chat.adapter";

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

  const storage = new LocalStorageAdapter();
  const chatService = new MockChatAdapter();
  const chatUseCase = new ChatUseCase(storage, chatService);

  return {
    subscribe,

    /**
     * Initialise le store avec les conversations existantes
     */
    async init() {
      update((state) => ({ ...state, isLoading: true }));
      try {
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
        await chatUseCase.deleteConversation(id);
        update((state) => {
          const newConversations = state.conversations.filter(
            (c) => c.id !== id
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
     * Envoie un message
     */
    async sendMessage(content: string) {
      const state = get({ subscribe });

      if (!state.currentConversationId) {
        const conversation = await this.createConversation();
        if (!conversation) return;
      }

      const currentState = get({ subscribe });
      const conversationId = currentState.currentConversationId!;

      update((s) => ({
        ...s,
        isStreaming: true,
        streamingContent: "",
      }));

      try {
        const { userMessage, assistantMessage } = await chatUseCase.sendMessage(
          conversationId,
          content,
          { stream: true },
          (chunk) => {
            update((s) => ({
              ...s,
              streamingContent: s.streamingContent + chunk,
            }));
          }
        );

        update((s) => {
          const conversations = s.conversations.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                messages: [
                  ...conv.messages.filter(
                    (m) =>
                      m.id !== userMessage.id && m.id !== assistantMessage.id
                  ),
                  userMessage,
                  assistantMessage,
                ],
                title:
                  conv.messages.length === 0
                    ? assistantMessage.content.substring(0, 40)
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
      } catch (error) {
        update((s) => ({
          ...s,
          error: (error as Error).message,
          isStreaming: false,
          streamingContent: "",
        }));
      }
    },

    /**
     * Renomme une conversation
     */
    async renameConversation(id: string, newTitle: string) {
      try {
        await chatUseCase.renameConversation(id, newTitle);
        update((state) => ({
          ...state,
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, title: newTitle } : conv
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
