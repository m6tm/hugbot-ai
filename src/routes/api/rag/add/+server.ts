import { json } from "@sveltejs/kit";
import { ServerRAGService } from "$lib/server/ai";
import type { RequestHandler } from "./$types";

/**
 * POST /api/rag/add
 * Ajoute un document à la base de connaissances
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { text, indexData } = await request.json();

		if (!text || typeof text !== "string") {
			return json({ error: "Le texte est requis" }, { status: 400 });
		}

		const ragService = ServerRAGService.getInstance();
		await ragService.initialize(indexData);
		const newIndexData = await ragService.addDocument(text);

		return json({
			success: true,
			indexData: newIndexData,
		});
	} catch (error) {
		console.error("Erreur lors de l'ajout du document:", error);
		return json({ error: (error as Error).message }, { status: 500 });
	}
};
