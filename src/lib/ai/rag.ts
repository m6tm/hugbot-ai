import { browser } from "$app/environment";
import { httpClient } from "$lib/infrastructure/http";

/**
 * Service RAG côté client
 * Appelle les endpoints API serveur pour le traitement langchain
 */
export class RAGService {
	private static instance: RAGService;
	private readonly STORAGE_KEY = "chat_ai_rag_index";

	private constructor() {}

	public static getInstance(): RAGService {
		if (!RAGService.instance) {
			RAGService.instance = new RAGService();
		}
		return RAGService.instance;
	}

	/**
	 * Récupère les données d'index stockées localement
	 */
	private getStoredIndexData(): string | null {
		if (!browser) return null;
		return localStorage.getItem(this.STORAGE_KEY);
	}

	/**
	 * Sauvegarde les données d'index localement
	 */
	private saveIndexData(indexData: string | null): void {
		if (!browser || !indexData) return;
		localStorage.setItem(this.STORAGE_KEY, indexData);
	}

	/**
	 * Ajouter un document à la base de connaissances
	 */
	async addDocument(text: string): Promise<void> {
		try {
			const { data: result } = await httpClient.post<{ indexData?: string }>(
				"/api/rag/add",
				{
					text,
					indexData: this.getStoredIndexData(),
				},
			);
			this.saveIndexData(result.indexData ?? null);
		} catch (error) {
			console.error("RAG addDocument failed:", error);
			throw error;
		}
	}

	/**
	 * Récupérer le contexte pertinent pour une requête
	 */
	async retrieveContext(query: string, k: number = 4): Promise<string> {
		try {
			const indexData = this.getStoredIndexData();

			if (!indexData) {
				return "";
			}

			const { data: result } = await httpClient.post<{
				context?: string;
				indexData?: string;
			}>("/api/rag/retrieve", { query, k, indexData });

			if (result.indexData) {
				this.saveIndexData(result.indexData);
			}

			return result.context || "";
		} catch (error) {
			console.error("RAG retrieveContext failed:", error);
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
}
