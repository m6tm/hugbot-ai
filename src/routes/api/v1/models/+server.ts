/**
 * Route API compatible OpenAI SDK - Liste des modeles
 * Endpoint: GET /api/v1/models
 */

import { availableModels } from "$lib/config/models";
import type { RequestHandler } from "./$types";

interface OpenAIModel {
	id: string;
	object: string;
	created: number;
	owned_by: string;
}

interface OpenAIModelsResponse {
	object: string;
	data: OpenAIModel[];
}

export const GET: RequestHandler = async () => {
	const models: OpenAIModel[] = availableModels.map((model) => ({
		id: model.modelId,
		object: "model",
		created: Math.floor(Date.now() / 1000),
		owned_by: model.provider,
	}));

	const response: OpenAIModelsResponse = {
		object: "list",
		data: models,
	};

	return new Response(JSON.stringify(response), {
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "*",
		},
	});
};

export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Access-Control-Allow-Methods": "GET, OPTIONS",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
		},
	});
};
