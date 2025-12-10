/**
 * Adaptateur LocalStorage pour la persistance des conversations
 */

import type { Conversation } from "$lib/domain/entities/conversation";
import type { StoragePort } from "$lib/domain/ports/storage.port";

const STORAGE_KEY = "chat_ai_conversations";

export class LocalStorageAdapter implements StoragePort {
	private getStoredData(): Map<string, Conversation> {
		if (typeof window === "undefined") {
			return new Map();
		}

		try {
			const data = localStorage.getItem(STORAGE_KEY);
			if (!data) return new Map();

			const parsed = JSON.parse(data) as Record<string, Conversation>;
			const map = new Map<string, Conversation>();

			for (const [id, conv] of Object.entries(parsed)) {
				map.set(id, {
					...conv,
					createdAt: new Date(conv.createdAt),
					updatedAt: new Date(conv.updatedAt),
					messages: conv.messages.map((m) => ({
						...m,
						createdAt: new Date(m.createdAt),
						updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
					})),
				});
			}

			return map;
		} catch {
			return new Map();
		}
	}

	private saveStoredData(data: Map<string, Conversation>): void {
		if (typeof window === "undefined") return;

		const obj: Record<string, Conversation> = {};
		for (const [id, conv] of data) {
			obj[id] = conv;
		}

		localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
	}

	async saveConversation(conversation: Conversation): Promise<void> {
		const data = this.getStoredData();
		data.set(conversation.id, conversation);
		this.saveStoredData(data);
	}

	async getConversation(id: string): Promise<Conversation | null> {
		const data = this.getStoredData();
		return data.get(id) || null;
	}

	async getAllConversations(): Promise<Conversation[]> {
		const data = this.getStoredData();
		const conversations = Array.from(data.values());
		return conversations.sort(
			(a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
		);
	}

	async deleteConversation(id: string): Promise<void> {
		const data = this.getStoredData();
		data.delete(id);
		this.saveStoredData(data);
	}

	async updateConversation(conversation: Conversation): Promise<void> {
		await this.saveConversation({
			...conversation,
			updatedAt: new Date(),
		});
	}
}
