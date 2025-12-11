import { browser } from "$app/environment";

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
			const response = await fetch("/api/rag/add", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					text,
					indexData: this.getStoredIndexData(),
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erreur lors de l'ajout");
			}

			const result = await response.json();
			this.saveIndexData(result.indexData);
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

			// Si pas de données d'index, retourner une chaîne vide
			if (!indexData) {
				return "";
			}

			const response = await fetch("/api/rag/retrieve", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					query,
					k,
					indexData,
				}),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Erreur lors de la récupération");
			}

			const result = await response.json();

			// Mettre à jour l'index si nécessaire
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
