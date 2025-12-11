import { json } from "@sveltejs/kit";
import { ServerRAGService } from "$lib/server/ai";
import type { RequestHandler } from "./$types";

/**
 * POST /api/rag/retrieve
 * Récupère le contexte pertinent pour une requête
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { query, k, indexData } = await request.json();

		if (!query || typeof query !== "string") {
			return json({ error: "La requête est requise" }, { status: 400 });
		}

		const ragService = ServerRAGService.getInstance();
		await ragService.initialize(indexData);
		const context = await ragService.retrieveContext(query, k || 4);

		return json({
			success: true,
			context,
			indexData: ragService.getSerializedData(),
		});
	} catch (error) {
		console.error("Erreur lors de la récupération du contexte:", error);
		return json({ error: (error as Error).message }, { status: 500 });
	}
};
