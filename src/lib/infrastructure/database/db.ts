/**
 * Configuration de la base de donnees IndexedDB avec Dexie
 */

import Dexie, { type EntityTable } from "dexie";

export interface ConversationRecord {
  id: string;
  title: string;
  messages: MessageRecord[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  isStreaming?: boolean;
}

export interface SettingsRecord {
  id: string;
  currentModelId: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  codeTheme: string;
}

export interface ThemeRecord {
  id: string;
  mode: "light" | "dark" | "system";
}

const DB_NAME = "chat_ai_db";
const DB_VERSION = 1;

class ChatAIDatabase extends Dexie {
  conversations!: EntityTable<ConversationRecord, "id">;
  settings!: EntityTable<SettingsRecord, "id">;
  theme!: EntityTable<ThemeRecord, "id">;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      conversations: "id, title, updatedAt, isActive",
      settings: "id",
      theme: "id",
    });
  }
}

export const db = new ChatAIDatabase();

/**
 * Verifie si IndexedDB est disponible
 */
export function isIndexedDBAvailable(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return "indexedDB" in window;
}
