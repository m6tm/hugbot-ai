/**
 * Adaptateur Dexie (IndexedDB) pour la persistance des conversations
 */

import type { Conversation } from "$lib/domain/entities/conversation";
import type { StoragePort } from "$lib/domain/ports/storage.port";
import {
  db,
  isIndexedDBAvailable,
  type ConversationRecord,
  type MessageRecord,
} from "../database/db";

export class DexieStorageAdapter implements StoragePort {
  /**
   * Convertit une Conversation en ConversationRecord pour le stockage
   */
  private toRecord(conversation: Conversation): ConversationRecord {
    return {
      id: conversation.id,
      title: conversation.title,
      messages: conversation.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        isStreaming: m.isStreaming,
      })) as MessageRecord[],
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      isActive: conversation.isActive,
    };
  }

  /**
   * Convertit un ConversationRecord en Conversation
   */
  private fromRecord(record: ConversationRecord): Conversation {
    return {
      id: record.id,
      title: record.title,
      messages: record.messages.map((m) => ({
        id: m.id,
        conversationId: m.conversationId,
        role: m.role,
        content: m.content,
        createdAt: new Date(m.createdAt),
        updatedAt: m.updatedAt ? new Date(m.updatedAt) : undefined,
        isStreaming: m.isStreaming,
      })),
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      isActive: record.isActive,
    };
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    if (!isIndexedDBAvailable()) return;

    // Ne pas sauvegarder les conversations sans messages
    if (conversation.messages.length === 0) return;

    await db.conversations.put(this.toRecord(conversation));
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!isIndexedDBAvailable()) return null;

    const record = await db.conversations.get(id);
    if (!record) return null;

    return this.fromRecord(record);
  }

  async getAllConversations(): Promise<Conversation[]> {
    if (!isIndexedDBAvailable()) return [];

    const records = await db.conversations
      .orderBy("updatedAt")
      .reverse()
      .toArray();

    return records.map((r) => this.fromRecord(r));
  }

  async deleteConversation(id: string): Promise<void> {
    if (!isIndexedDBAvailable()) return;

    await db.conversations.delete(id);
  }

  async updateConversation(conversation: Conversation): Promise<void> {
    await this.saveConversation({
      ...conversation,
      updatedAt: new Date(),
    });
  }
}
