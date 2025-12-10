import type { Document } from "@langchain/core/documents";
import { AppVectorStore } from "./vectorStore";

export class RAGService {
	private static instance: RAGService;
	private vectorStore: AppVectorStore;

	private constructor() {
		this.vectorStore = AppVectorStore.getInstance();
	}

	public static getInstance(): RAGService {
		if (!RAGService.instance) {
			RAGService.instance = new RAGService();
		}
		return RAGService.instance;
	}

	/**
	 * Add a document to the knowledge base.
	 */
	async addDocument(text: string): Promise<void> {
		const doc: Document = {
			pageContent: text,
			metadata: { source: "user-input", createdAt: new Date().toISOString() },
		};
		await this.vectorStore.addDocuments([doc]);
	}

	/**
	 * Retrieve relevant documents for a given query.
	 */
	async retrieveContext(query: string, k: number = 4): Promise<string> {
		try {
			const results = await this.vectorStore.similaritySearch(query, k);

			if (results.length === 0) {
				return "";
			}

			const context = results.map((doc) => doc.pageContent).join("\n\n---\n\n");
			return `Context information is below.\n---------------------\n${context}\n---------------------\nGiven the context information and not prior knowledge, answer the query.`;
		} catch (error) {
			console.error("RAG Retrieval failed:", error);
			return "";
		}
	}

	/**
	 * Enhanced prompt construction (optional, if we want full prompt)
	 */
	async constructPrompt(query: string): Promise<string> {
		const contextBlock = await this.retrieveContext(query);
		if (!contextBlock) return query;

		return `${contextBlock}\n\nQuery: ${query}`;
	}
}
