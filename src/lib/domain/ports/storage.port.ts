/**
 * Port pour le stockage des conversations
 */

import type { Conversation } from "../entities/conversation";

export interface StoragePort {
	/**
	 * Sauvegarde une conversation
	 */
	saveConversation(conversation: Conversation): Promise<void>;

	/**
	 * Recupere une conversation par son ID
	 */
	getConversation(id: string): Promise<Conversation | null>;

	/**
	 * Recupere toutes les conversations
	 */
	getAllConversations(): Promise<Conversation[]>;

	/**
	 * Recupere les conversations modifiees depuis une date
	 */
	getConversationsModifiedSince(date: Date): Promise<Conversation[]>;

	/**
	 * Supprime une conversation
	 */
	deleteConversation(id: string): Promise<void>;

	/**
	 * Met a jour une conversation
	 */
	updateConversation(conversation: Conversation): Promise<void>;
}
