/**
 * Entite Conversation representant une conversation complete
 */

import type { Message } from "./message";

export interface Conversation {
	id: string;
	title: string;
	messages: Message[];
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
}

export interface CreateConversationInput {
	title?: string;
}

/**
 * Cree une nouvelle conversation
 */
export function createConversation(
	input?: CreateConversationInput,
): Conversation {
	const now = new Date();
	return {
		id: crypto.randomUUID(),
		title: input?.title || "Nouvelle conversation",
		messages: [],
		createdAt: now,
		updatedAt: now,
		isActive: true,
	};
}

/**
 * Genere un titre automatique basé sur le premier message
 */
export function generateTitle(firstMessage: string): string {
	const maxLength = 40;
	const cleaned = firstMessage.trim().replace(/\n/g, " ");
	if (cleaned.length <= maxLength) {
		return cleaned;
	}
	return `${cleaned.substring(0, maxLength)}...`;
}
