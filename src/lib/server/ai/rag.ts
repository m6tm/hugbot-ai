import type { Document } from "@langchain/core/documents";
import { ServerVectorStore } from "./vectorStore";

/**
 * Service RAG côté serveur
 * SERVEUR UNIQUEMENT - Ne pas importer côté client.
 */
export class ServerRAGService {
	private static instance: ServerRAGService;
	private vectorStore: ServerVectorStore;

	private constructor() {
		this.vectorStore = ServerVectorStore.getInstance();
	}

	public static getInstance(): ServerRAGService {
		if (!ServerRAGService.instance) {
			ServerRAGService.instance = new ServerRAGService();
		}
		return ServerRAGService.instance;
	}

	/**
	 * Initialiser avec des données du client
	 */
	async initialize(serializedData?: string): Promise<void> {
		await this.vectorStore.initialize(serializedData);
	}

	/**
	 * Ajouter un document à la base de connaissances
	 */
	async addDocument(text: string): Promise<string> {
		const doc: Document = {
			pageContent: text,
			metadata: { source: "user-input", createdAt: new Date().toISOString() },
		};
		return await this.vectorStore.addDocuments([doc]);
	}

	/**
	 * Récupérer le contexte pertinent pour une requête
	 */
	async retrieveContext(query: string, k: number = 4): Promise<string> {
		try {
			const results = await this.vectorStore.similaritySearch(query, k);

			if (results.length === 0) {
				return "";
			}

			const context = results
				.map((doc: Document) => doc.pageContent)
				.join("\n\n---\n\n");
			return `Context information is below.\n---------------------\n${context}\n---------------------\nGiven the context information and not prior knowledge, answer the query.`;
		} catch (error) {
			console.error("RAG Retrieval failed:", error);
			return "";
		}
	}

	/**
	 * Construction de prompt enrichi
	 */
	async constructPrompt(query: string): Promise<string> {
		const contextBlock = await this.retrieveContext(query);
		if (!contextBlock) return query;

		return `${contextBlock}\n\nQuery: ${query}`;
	}

	/**
	 * Obtenir les données sérialisées pour le client
	 */
	getSerializedData(): string | null {
		return this.vectorStore.getSerializedData();
	}
}
