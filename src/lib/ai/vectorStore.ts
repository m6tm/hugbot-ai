import type { Document } from "@langchain/core/documents";
import { browser } from "$app/environment";
import { LocalEmbeddings } from "./embeddings";

// Types - avoiding direct import due to resolution issues
// biome-ignore lint/suspicious/noExplicitAny: External library without types
type VoyClient = any;
// biome-ignore lint/suspicious/noExplicitAny: External library without types
type VoyStore = any;

// Helper to interact with the raw Voy Index and persistence layer

// Revised Class
export class AppVectorStore {
	private static instance: AppVectorStore;
	private voyClient: VoyClient | null = null;
	private store: VoyStore | null = null;
	private embeddings: LocalEmbeddings;
	private readonly STORAGE_KEY = "chat_ai_voy_index";

	private constructor() {
		this.embeddings = LocalEmbeddings.getInstance();
	}

	public static getInstance(): AppVectorStore {
		if (!AppVectorStore.instance) {
			AppVectorStore.instance = new AppVectorStore();
		}
		return AppVectorStore.instance;
	}

	async getStore(): Promise<VoyStore> {
		if (!browser) {
			// Return a dummy or throw context-aware error,
			// though usually this shouldn't be called in SSR for RAG logic
			throw new Error("Vector store is only available in the browser");
		}

		if (this.store) return this.store;

		// Dynamic imports to avoid SSR issues with WASM/browser-only packages
		const { Voy } = await import("voy-search");
		const { VoyVectorStore } = await import(
			"@langchain/community/vectorstores/voy"
		);

		const data = localStorage.getItem(this.STORAGE_KEY);

		if (data) {
			try {
				this.voyClient = Voy.deserialize(data);
				console.log("VectorStore: Loaded index.");
			} catch (e) {
				console.error("VectorStore: Error loading index", e);
				this.voyClient = new Voy();
			}
		} else {
			this.voyClient = new Voy();
		}

		this.store = new VoyVectorStore(this.voyClient, this.embeddings);
		return this.store;
	}

	async addDocuments(docs: Document[]) {
		if (!browser) return;
		const store = await this.getStore();
		await store.addDocuments(docs);
		this.save();
	}

	private save() {
		if (this.voyClient && browser) {
			const serialized = this.voyClient.serialize();
			localStorage.setItem(this.STORAGE_KEY, serialized);
			console.log("VectorStore: Index saved.");
		}
	}

	async similaritySearch(query: string, k = 4) {
		if (!browser) return [];
		const store = await this.getStore();
		return store.similaritySearch(query, k);
	}
}
