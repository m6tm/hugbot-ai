/**
 * Store Svelte pour gerer l'etat du chat
 * Utilise uniquement la base de donnees en ligne (Supabase via Prisma)
 */

import { derived, get, writable } from "svelte/store";
import { invalidate } from "$app/navigation";
import { getModelById } from "$lib/config/models";
import type { Conversation } from "$lib/domain/entities/conversation";
import { HttpClientError, httpClient } from "$lib/infrastructure/http";
import { settingsStore } from "./settings.store";

interface ChatState {
	conversations: Conversation[];
	currentConversationId: string | null;
	deletingConversationId: string | null;
	isLoading: boolean;
	isMessagesLoading: boolean;
	isStreaming: boolean;
	streamingContent: string;
	error: string | null;
}

const initialState: ChatState = {
	conversations: [],
	currentConversationId: null,
	deletingConversationId: null,
	isLoading: false,
	isMessagesLoading: false,
	isStreaming: false,
	streamingContent: "",
	error: null,
};

function createChatStore() {
	const { subscribe, set, update } = writable<ChatState>(initialState);

	/**
	 * Trie les conversations par date de mise a jour (plus recent en premier)
	 */
	function sortConversations(conversations: Conversation[]): Conversation[] {
		return [...conversations].sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
		);
	}

	return {
		subscribe,

		/**
		 * Initialise le store avec les conversations existantes
		 * Peut etre hydrate avec des donnees serveur
		 */
		async init(serverConversations: Conversation[] = []) {
			if (serverConversations.length > 0) {
				const hydratedConversations = serverConversations.map((c) => ({
					...c,
					createdAt: new Date(c.createdAt),
					updatedAt: new Date(c.updatedAt),
					messages: (c.messages || []).map((m) => ({
						...m,
						createdAt: new Date(m.createdAt),
					})),
				}));
				update((state) => ({
					...state,
					conversations: hydratedConversations,
					isLoading: false,
				}));
				return;
			}

			update((state) => ({ ...state, isLoading: true }));
			try {
				const { data: conversations } =
					await httpClient.get<Conversation[]>("/api/conversations");

				const hydratedConversations = conversations.map((c) => ({
					...c,
					createdAt: new Date(c.createdAt),
					updatedAt: new Date(c.updatedAt),
					messages: c.messages.map((m) => ({
						...m,
						createdAt: new Date(m.createdAt),
					})),
				}));

				update((state) => ({
					...state,
					conversations: hydratedConversations,
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

		setConversations(conversations: Conversation[]) {
			update((s) => ({ ...s, conversations }));
		},

		/**
		 * Cree une nouvelle conversation
		 * Si la conversation actuelle est vide (aucun message), on la reutilise
		 */
		async createConversation() {
			const currentState = get({ subscribe });

			// Verifie si la conversation actuelle existe et n'a aucun message
			if (currentState.currentConversationId) {
				const currentConv = currentState.conversations.find(
					(c) => c.id === currentState.currentConversationId,
				);
				if (currentConv && currentConv.messages.length === 0) {
					return currentConv;
				}
			}

			// Pour la version serveur, on cree juste un objet temporaire local
			// La vraie creation se fera au premier message
			const _tempId = crypto.randomUUID();
			const newConv: Conversation = {
				id: _tempId,
				title: "Nouvelle conversation",
				createdAt: new Date(),
				updatedAt: new Date(),
				messages: [],
				isActive: true,
			};

			try {
				update((state) => ({
					...state,
					conversations: [newConv, ...state.conversations],
					currentConversationId: newConv.id,
				}));

				return newConv;
			} catch (error) {
				update((state) => ({
					...state,
					error: (error as Error).message,
				}));
				return null;
			}
		},

		async loadConversationMessages(id: string) {
			update((state) => ({ ...state, isMessagesLoading: true }));
			try {
				const { data: fullConv } = await httpClient.get<{
					messages: Conversation["messages"];
				}>(`/api/conversations/${id}`);
				const messages = (fullConv.messages || []).map((m) => ({
					...m,
					createdAt: new Date(m.createdAt),
				}));

				update((state) => ({
					...state,
					conversations: state.conversations.map((c) =>
						c.id === id ? { ...c, messages: messages } : c,
					),
					isMessagesLoading: false,
				}));
			} catch (e) {
				console.error("Failed to load messages", e);
				update((state) => ({ ...state, isMessagesLoading: false }));
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

			// Load messages if they are empty (or only have preview)
			const state = get({ subscribe });
			const _conv = state.conversations.find((c) => c.id === id);

			// Rough check: if we have 0 or 1 message it might be preview, but what if it's really 1?
			// Use a flag or check if we loaded it. For now let's always fetch to be safe or check if messages count matches expected?
			// Simpler: Just fetch transparently
			if (id && id !== "temp-new") {
				this.loadConversationMessages(id);
			}
		},

		/**
		 * Supprime une conversation
		 * Si la conversation supprimee est celle active, on la ferme (currentConversationId = null)
		 */
		async deleteConversation(id: string) {
			update((state) => ({ ...state, deletingConversationId: id }));
			try {
				if (id && id !== "temp-new") {
					await httpClient.delete(`/api/conversations/${id}`);
				}

				update((state) => {
					const newConversations = state.conversations.filter(
						(c) => c.id !== id,
					);
					const isCurrent = state.currentConversationId === id;

					return {
						...state,
						conversations: newConversations,
						// Si c'etait la conversation active, on met a null (pas de conversation selectionnee)
						currentConversationId: isCurrent
							? null
							: state.currentConversationId,
						deletingConversationId: null,
					};
				});
			} catch (error) {
				update((state) => ({
					...state,
					error: (error as Error).message,
					deletingConversationId: null,
				}));
			}
		},

		/**
		 * Envoie un message (utilise le modele actuellement selectionne)
		 */
		async sendMessage(content: string) {
			const state = get({ subscribe });
			let conversationId = state.currentConversationId;

			if (!conversationId || conversationId === "temp-new") {
				// C'est le premier message d'une nouvelle conv
				// On laisse l'API creer la conv et renvoyer l'ID
			}

			// Create optimistic user message
			const userMsg = {
				role: "user" as const,
				content,
				id: crypto.randomUUID(),
				createdAt: new Date(),
				conversationId: conversationId || "temp-new",
			};

			update((s) => {
				// If "temp-new", create a real placeholder in store if not exists
				const _convs = s.conversations;
				if (conversationId === "temp-new") {
					// We might want to remove the temp one and add a real one once verified, or just update it
				}
				const updatedConvs = s.conversations.map((c) =>
					c.id === conversationId || (conversationId === "temp-new" && !c.id)
						? {
								...c,
								messages: [...c.messages, userMsg],
								updatedAt: new Date(),
							}
						: c,
				);

				return {
					...s,
					isStreaming: true,
					streamingContent: "",
					conversations: sortConversations(updatedConvs),
				};
			});

			const settings = get(settingsStore);
			const model = getModelById(settings.currentModelId);

			try {
				// L'historique est maintenant charge cote serveur depuis la BDD
				const res = await httpClient.postStream("/api/chat", {
					message: content,
					modelId: model?.modelId || settings.currentModelId,
					temperature: settings.temperature,
					maxTokens: settings.maxTokens,
					stream: true,
					conversationId:
						conversationId === "temp-new" ? undefined : conversationId,
					systemInstruction: settings.systemInstruction || undefined,
				});

				// Capture new conversation ID if it was created
				const newId = res.headers.get("X-Conversation-Id");
				if (newId && (!conversationId || conversationId === "temp-new")) {
					update((s) => ({
						...s,
						currentConversationId: newId,
						conversations: s.conversations.map((c) =>
							c.id === "temp-new" ? { ...c, id: newId } : c,
						),
					}));
					conversationId = newId;
				}

				const reader = res.body?.getReader();
				if (!reader) return;
				const decoder = new TextDecoder();

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					const chunk = decoder.decode(value);
					const lines = chunk.split("\n");
					for (const line of lines) {
						if (line.startsWith("data: ")) {
							const dataStr = line.slice(6);
							if (dataStr === "[DONE]") break;
							try {
								const data = JSON.parse(dataStr);
								if (data.content) {
									update((s) => ({
										...s,
										streamingContent: s.streamingContent + data.content,
									}));
								}
							} catch (_e) {}
						}
					}
				}

				// Finalize
				const finalContent = get({ subscribe }).streamingContent;
				const assistantMsg = {
					role: "assistant" as const,
					content: finalContent,
					id: crypto.randomUUID(),
					createdAt: new Date(),
					conversationId: conversationId || "temp-new",
				};

				update((s) => {
					const updatedConversations = s.conversations.map((c) =>
						c.id === conversationId || (!c.id && conversationId === "temp-new")
							? {
									...c,
									messages: [...c.messages, assistantMsg],
									id: conversationId,
									updatedAt: new Date(),
								}
							: c,
					);
					return {
						...s,
						isStreaming: false,
						streamingContent: "",
						conversations: sortConversations(updatedConversations),
					};
				});

				invalidate("app:conversations");
			} catch (error) {
				const errorMessage =
					error instanceof HttpClientError
						? error.message
						: (error as Error).message;
				update((state) => ({
					...state,
					error: errorMessage,
					isStreaming: false,
					streamingContent: "",
				}));
			}
		},

		/**
		 * Modifie un message utilisateur et regenere la reponse
		 * Supprime tous les messages apres le message modifie
		 */
		async editMessage(messageId: string, newContent: string) {
			const state = get({ subscribe });
			const conversationId = state.currentConversationId;
			if (!conversationId) return;

			const conversation = state.conversations.find(
				(c) => c.id === conversationId,
			);
			if (!conversation) return;

			// Optimistic update
			const messageIndex = conversation.messages.findIndex(
				(m) => m.id === messageId,
			);
			if (messageIndex === -1) return;

			const messagesBeforeEdit = conversation.messages.slice(0, messageIndex);

			update((s) => ({
				...s,
				conversations: s.conversations.map((c) =>
					c.id === conversationId ? { ...c, messages: messagesBeforeEdit } : c,
				),
			}));

			// Server update (rewind)
			if (conversationId !== "temp-new") {
				await httpClient.delete(
					`/api/conversations/${conversationId}/messages?fromId=${messageId}`,
				);
			}

			// Send new message
			await this.sendMessage(newContent);
		},

		/**
		 * Regenere le dernier message de l'assistant
		 */
		async regenerateMessage(messageId: string) {
			const state = get({ subscribe });
			const conversationId = state.currentConversationId;
			if (!conversationId) return;

			const conversation = state.conversations.find(
				(c) => c.id === conversationId,
			);
			if (!conversation) return;

			const messageIndex = conversation.messages.findIndex(
				(m) => m.id === messageId,
			);

			if (messageIndex === -1) return;

			// Identifions le message utilisateur precedent
			// Si on regenere un message assistant, on doit reenoyer le message user d'avant.
			// MAIS: le endpoint sendMessage prend "content" et ajoute un message user.
			// DONC, on doit:
			// 1. Supprimer le message assistant (messageId)
			// 2. Trouver le contenu du message user precedent
			// 3. Supprimer AUSSI le message user precedent (pour que sendMessage le recree) sinon on aura un doublon?
			// OU BIEN, on cree une methode API qui ne cree pas de message user mais complete juste.
			//
			// SIMPLIFICATION: On fait comme editMessage.
			// On supprime TOUT a partir du message user precedent, et on le "renvoie".

			// Si le message cible est assistant:
			const targetMessage = conversation.messages[messageIndex];
			if (targetMessage.role !== "assistant") return; // On regenere generalement l'assistant

			const previousMessage = conversation.messages[messageIndex - 1];
			if (!previousMessage || previousMessage.role !== "user") return;

			// On utilise editMessage sur le message PRECEDENT avec son PROPRE contenu.
			await this.editMessage(previousMessage.id, previousMessage.content);
		},

		/**
		 * Renomme une conversation
		 */
		async renameConversation(id: string, newTitle: string) {
			try {
				if (id && id !== "temp-new") {
					await httpClient.patch(`/api/conversations/${id}`, {
						title: newTitle,
					});
				}

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
