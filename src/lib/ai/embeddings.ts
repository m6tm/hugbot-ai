import { Embeddings } from "@langchain/core/embeddings";
import type { FeatureExtractionPipeline } from "@xenova/transformers";

/**
 * Custom Embeddings class using local Transformers.js models.
 * This ensures no API calls are made for embedding generation.
 */
export class LocalEmbeddings extends Embeddings {
	private static instance: LocalEmbeddings;
	private pipe: FeatureExtractionPipeline | null = null;
	private modelName: string;

	constructor(modelName: string = "Xenova/all-MiniLM-L6-v2") {
		super({});
		this.modelName = modelName;
	}

	public static getInstance(): LocalEmbeddings {
		if (!LocalEmbeddings.instance) {
			LocalEmbeddings.instance = new LocalEmbeddings();
		}
		return LocalEmbeddings.instance;
	}

	/**
	 * Initialize the pipeline if it hasn't been initialized yet.
	 */
	private async initPipeline() {
		if (!this.pipe) {
			console.log(
				"Parameters: Loading local embedding model...",
				this.modelName,
			);
			const { pipeline } = await import("@xenova/transformers");
			this.pipe = await pipeline("feature-extraction", this.modelName);
			console.log("Parameters: Local embedding model loaded.");
		}
	}

	/**
	 * Embed a single query.
	 */
	async embedQuery(text: string): Promise<number[]> {
		await this.initPipeline();
		if (!this.pipe) throw new Error("Pipeline not initialized");

		const result = await this.pipe(text, { pooling: "mean", normalize: true });
		return Array.from(result.data);
	}

	/**
	 * Embed multiple documents.
	 */
	async embedDocuments(documents: string[]): Promise<number[][]> {
		await this.initPipeline();
		if (!this.pipe) throw new Error("Pipeline not initialized");

		const embeddings: number[][] = [];
		for (const doc of documents) {
			const result = await this.pipe(doc, { pooling: "mean", normalize: true });
			embeddings.push(Array.from(result.data));
		}
		return embeddings;
	}
}
