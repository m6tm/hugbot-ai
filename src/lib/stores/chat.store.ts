/**
 * Store Svelte pour gerer l'etat du chat
 */

import { derived, get, writable } from "svelte/store";
import { invalidate } from "$app/navigation";
import { ChatUseCase } from "$lib/application/use-cases/chat.use-case";
import { getModelById } from "$lib/config/models";
import type { Conversation } from "$lib/domain/entities/conversation";
import type { ChatServicePort } from "$lib/domain/ports/chat-service.port";
import { DexieStorageAdapter } from "$lib/infrastructure/adapters/dexie-storage.adapter";
import { HuggingFaceAdapter } from "$lib/infrastructure/adapters/huggingface.adapter";
import { MockChatAdapter } from "$lib/infrastructure/adapters/mock-chat.adapter";
import { settingsStore } from "./settings.store";

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
		 * Peut etre hydrate avec des donnees serveur
		 */
		async init(serverConversations: Conversation[] = []) {
			if (serverConversations.length > 0) {
				update((state) => ({
					...state,
					conversations: serverConversations,
					isLoading: false,
				}));
				return;
			}

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
				//const chatUseCase = createUseCase();
				//const conversation = await chatUseCase.createNewConversation();
				update((state) => ({
					...state,
					conversations: [newConv, ...state.conversations], // Ajout en haut
					currentConversationId: null, // Pas d'ID reel encore
					// Wait, logic needs currentConversationId to be set for the UI to show the chat area
				}));

				// Hack: use a temp ID for UI, but handle it cleanly in sendMessage
				// For now let's just use what we have but be aware sendMessage needs to handle creation

				// Revert to simple local creation for store state
				update((state) => ({
					...state,
					conversations: [newConv, ...state.conversations],
					currentConversationId: newConv.id || "temp-new", // Fallback
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
			try {
				const res = await fetch(`/api/conversations/${id}`);
				if (res.ok) {
					const fullConv = await res.json();
					update((state) => ({
						...state,
						conversations: state.conversations.map((c) =>
							c.id === id ? { ...c, messages: fullConv.messages } : c,
						),
					}));
				}
			} catch (e) {
				console.error("Failed to load messages", e);
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
		 */
		async deleteConversation(id: string) {
			try {
				//const chatUseCase = createUseCase();
				//await chatUseCase.deleteConversation(id);
				// Call API
				// await fetch(`/api/conversations/${id}`, { method: 'DELETE' }); // Need to implement this too eventually

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
				return {
					...s,
					isStreaming: true,
					streamingContent: "",
					conversations: s.conversations.map((c) =>
						c.id === conversationId || (conversationId === "temp-new" && !c.id)
							? { ...c, messages: [...c.messages, userMsg] }
							: c,
					),
				};
			});

			const settings = get(settingsStore);

			try {
				// Call our API
				const res = await fetch("/api/chat", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						messages: [{ role: "user", content }], // Should send history? +server.ts looks at body.messages.
						// Ideally we send history context.
						// Let's grab last N messages from store
						modelId: settings.currentModelId, // Need to make sure we send this
						temperature: settings.temperature,
						maxTokens: settings.maxTokens,
						stream: true,
						conversationId:
							conversationId === "temp-new" ? undefined : conversationId,
					}),
				});

				// RAG Integration - skipping for now to focus on basic db integration,
				// but normally we'd do retrieval here or on server. API handles basic chat.

				// Handle streaming response
				if (res.ok) {
					// Capture new conversation ID if it was created
					const newId = res.headers.get("X-Conversation-Id");
					if (newId && (!conversationId || conversationId === "temp-new")) {
						// Update current conversation ID immediately if it was temp
						update((s) => ({
							...s,
							currentConversationId: newId,
							conversations: s.conversations.map((c) =>
								c.id === "temp-new" ? { ...c, id: newId } : c,
							),
						}));
						// Update local variable for checking later
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

					update((s) => ({
						...s,
						isStreaming: false,
						streamingContent: "",
						conversations: s.conversations.map((c) =>
							c.id === conversationId ||
							(!c.id && conversationId === "temp-new")
								? {
										...c,
										messages: [...c.messages, assistantMsg],
										id: conversationId,
									} // Ensure ID is set
								: c,
						),
					}));

					invalidate("app:conversations");
				}
			} catch (error) {
				update((state) => ({
					...state,
					error: (error as Error).message,
					isStreaming: false,
					streamingContent: "",
				}));
			}
		},

		// ... keep other methods if needed or refactor

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
				await fetch(
					`/api/conversations/${conversationId}/messages?fromId=${messageId}`,
					{
						method: "DELETE",
					},
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
					await fetch(`/api/conversations/${id}`, {
						method: "PATCH",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ title: newTitle }),
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

		/**
		 * Synchronise les conversations locales avec le serveur
		 */
		async sync() {
			try {
				if (typeof localStorage === "undefined") return;

				const lastSyncStr = localStorage.getItem("lastSyncTimestamp");
				const lastSyncDate = lastSyncStr ? new Date(lastSyncStr) : new Date(0);

				// Requete via l'adapter
				// Note: On doit caster storage car l'interface n'a pas forcement tout si on l'a pas mise a jour partout
				// mais ici on sait que c'est DexieStorageAdapter
				const modifiedConversations =
					await storage.getConversationsModifiedSince(lastSyncDate);

				if (modifiedConversations.length === 0) {
					console.log("No conversations to sync");
					return;
				}

				console.log(`Syncing ${modifiedConversations.length} conversations...`);

				const res = await fetch("/api/sync", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ conversations: modifiedConversations }),
				});

				if (res.ok) {
					const now = new Date().toISOString();
					localStorage.setItem("lastSyncTimestamp", now);
					console.log("Sync success");
				} else {
					console.error("Sync failed", await res.text());
				}
			} catch (error) {
				console.error("Sync error", error);
			}
		},

		/**
		 * Restaure les conversations du serveur vers la base locale
		 * Fusionne intelligemment avec les donnees locales existantes
		 */
		async restore() {
			try {
				const res = await fetch("/api/sync/restore");
				if (!res.ok) {
					console.error("Restore failed", await res.text());
					return;
				}

				const serverConversations: Conversation[] = await res.json();

				if (serverConversations.length === 0) {
					console.log("No conversations to restore");
					return;
				}

				console.log(`Restoring ${serverConversations.length} conversations...`);

				// Pour chaque conversation du serveur, verifier si elle existe localement
				for (const serverConv of serverConversations) {
					const localConv = await storage.getConversation(serverConv.id);

					if (!localConv) {
						// La conversation n'existe pas localement, on la sauvegarde
						await storage.saveConversation(serverConv);
					} else {
						// La conversation existe, on garde la plus recente
						const serverDate = new Date(serverConv.updatedAt);
						const localDate = new Date(localConv.updatedAt);

						if (serverDate > localDate) {
							await storage.saveConversation(serverConv);
						}
					}
				}

				// Recharger les conversations depuis Dexie
				const allConversations = await storage.getAllConversations();
				update((state) => ({
					...state,
					conversations: allConversations,
				}));

				console.log("Restore success");
			} catch (error) {
				console.error("Restore error", error);
			}
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
