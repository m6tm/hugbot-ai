import { VoyVectorStore } from "@langchain/community/vectorstores/voy";
import type { Document } from "@langchain/core/documents";
import { Voy } from "voy-search";
import { LocalEmbeddings } from "./embeddings";

// Helper to interact with the raw Voy Index and persistence layer

// Revised Class
export class AppVectorStore {
	private static instance: AppVectorStore;
	private voyClient: Voy | null = null;
	private store: VoyVectorStore | null = null;
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

	async getStore(): Promise<VoyVectorStore> {
		if (this.store) return this.store;

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
		const store = await this.getStore();
		await store.addDocuments(docs);
		this.save();
	}

	private save() {
		if (this.voyClient) {
			const serialized = this.voyClient.serialize();
			localStorage.setItem(this.STORAGE_KEY, serialized);
			console.log("VectorStore: Index saved.");
		}
	}

	async similaritySearch(query: string, k = 4) {
		const store = await this.getStore();
		return store.similaritySearch(query, k);
	}
}
