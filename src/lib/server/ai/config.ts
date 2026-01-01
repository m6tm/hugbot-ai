import { env } from "$env/dynamic/private";
import { getModelById } from "$lib/config/models";

/**
 * Configuration de l'IA calculée dynamiquement
 */
export interface AIConfig {
	apiKey: string;
	baseURL: string;
	provider: string;
}

/**
 * Récupère la configuration de l'IA (clé API et URL de base) en fonction du modèle
 * ou de la configuration globale définie dans les variables d'environnement.
 *
 * @param modelId - L'identifiant du modèle demandé
 * @param userApiKey - Clé API fournie par l'utilisateur (optionnelle)
 * @returns La configuration de l'IA
 */
export function getAIConfig(modelId: string, userApiKey?: string): AIConfig {
	const model = getModelById(modelId);
	const provider =
		model?.provider || (env.AI_PROVIDER as string) || "huggingface";

	let apiKey = userApiKey;

	// Si pas de clé utilisateur, on cherche dans les variables d'environnement du serveur
	if (!apiKey) {
		switch (provider) {
			case "openai":
				apiKey = env.OPENAI_API_KEY;
				break;
			case "gemini":
				apiKey = env.GEMINI_API_KEY;
				break;
			case "claude":
				apiKey = env.CLAUDE_API_KEY;
				break;
			default:
				apiKey = env.HUGGINGFACE_API_KEY;
				break;
		}
	}

	// Détermination de l'URL de base
	let baseURL = "";
	switch (provider) {
		case "openai":
			baseURL = env.OPENAI_BASE_URL || "https://api.openai.com/v1";
			break;
		case "gemini":
			baseURL =
				env.GEMINI_BASE_URL ||
				"https://generativelanguage.googleapis.com/v1beta/openai/";
			break;
		case "claude":
			baseURL = env.CLAUDE_BASE_URL || "";
			break;
		default:
			baseURL = env.HUGGINGFACE_BASE_URL || "https://router.huggingface.co/v1";
			break;
	}

	// Override global si AI_BASE_URL est défini
	if (env.AI_BASE_URL) {
		baseURL = env.AI_BASE_URL;
	}

	return {
		apiKey: apiKey || "",
		baseURL,
		provider,
	};
}
