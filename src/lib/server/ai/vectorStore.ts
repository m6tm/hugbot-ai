import type { Document } from "@langchain/core/documents";
import { LocalEmbeddings } from "./embeddings";

// biome-ignore lint/suspicious/noExplicitAny: External library without types
type VoyClient = any;
// biome-ignore lint/suspicious/noExplicitAny: External library without types
type VoyStore = any;

/**
 * Vector Store serveur utilisant LangChain et Voy
 * SERVEUR UNIQUEMENT - Ne pas importer côté client.
 */
export class ServerVectorStore {
	private static instance: ServerVectorStore;
	private voyClient: VoyClient | null = null;
	private store: VoyStore | null = null;
	private embeddings: LocalEmbeddings;
	private indexData: string | null = null;

	private constructor() {
		this.embeddings = LocalEmbeddings.getInstance();
	}

	public static getInstance(): ServerVectorStore {
		if (!ServerVectorStore.instance) {
			ServerVectorStore.instance = new ServerVectorStore();
		}
		return ServerVectorStore.instance;
	}

	/**
	 * Initialise le store avec des données sérialisées (depuis le client)
	 */
	async initialize(serializedData?: string): Promise<void> {
		const { Voy } = await import("voy-search");
		const { VoyVectorStore } = await import(
			"@langchain/community/vectorstores/voy"
		);

		if (serializedData) {
			try {
				this.voyClient = Voy.deserialize(serializedData);
				this.indexData = serializedData;
				console.log("ServerVectorStore: Index chargé depuis les données.");
			} catch (e) {
				console.error("ServerVectorStore: Erreur lors du chargement", e);
				this.voyClient = new Voy();
			}
		} else if (!this.voyClient) {
			this.voyClient = new Voy();
		}

		this.store = new VoyVectorStore(this.voyClient, this.embeddings);
	}

	/**
	 * Ajouter des documents
	 */
	async addDocuments(docs: Document[]): Promise<string> {
		if (!this.store) {
			await this.initialize();
		}

		await this.store.addDocuments(docs);
		const serialized = this.voyClient.serialize();
		this.indexData = serialized;
		return serialized;
	}

	/**
	 * Recherche de similarité
	 */
	async similaritySearch(query: string, k = 4): Promise<Document[]> {
		if (!this.store) {
			return [];
		}

		return this.store.similaritySearch(query, k);
	}

	/**
	 * Obtenir les données sérialisées
	 */
	getSerializedData(): string | null {
		return this.indexData;
	}
}
