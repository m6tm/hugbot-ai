/**
 * Entite Message representant un message dans une conversation
 */

export type MessageRole = "user" | "assistant" | "system";

export interface Message {
	id: string;
	conversationId: string;
	role: MessageRole;
	content: string;
	createdAt: Date;
	updatedAt?: Date;
	isStreaming?: boolean;
}

export interface CreateMessageInput {
	conversationId: string;
	role: MessageRole;
	content: string;
}

/**
 * Cree un nouvel objet Message
 */
export function createMessage(input: CreateMessageInput): Message {
	return {
		id: crypto.randomUUID(),
		conversationId: input.conversationId,
		role: input.role,
		content: input.content,
		createdAt: new Date(),
		isStreaming: false,
	};
}
