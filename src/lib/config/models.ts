/**
 * Configuration des modeles AI disponibles
 */

export interface AIModel {
	id: string;
	name: string;
	provider: "huggingface" | "openai" | "gemini" | "claude" | "mock";
	modelId: string;
	description: string;
	maxTokens: number;
	isDefault?: boolean;
}

export const availableModels: AIModel[] = [
	// Désactivé pour l'instant
	// {
	//   id: "mock",
	//   name: "Demo (Mock)",
	//   provider: "mock",
	//   modelId: "mock",
	//   description: "Mode demonstration sans API",
	//   maxTokens: 2048,
	// },
	{
		id: "deepseek-v3",
		name: "DeepSeek V3.2",
		provider: "huggingface",
		modelId: "deepseek-ai/DeepSeek-V3.2",
		description: "Modele DeepSeek puissant et rapide",
		maxTokens: 4096,
		isDefault: true,
	},
	{
		id: "qwen-72b",
		name: "Qwen 2.5 72B",
		provider: "huggingface",
		modelId: "Qwen/Qwen2.5-72B-Instruct",
		description: "Modele Alibaba tres performant",
		maxTokens: 4096,
	},
	{
		id: "llama-3-70b",
		name: "Llama 3.3 70B",
		provider: "huggingface",
		modelId: "meta-llama/Llama-3.3-70B-Instruct",
		description: "Modele Meta derniere generation",
		maxTokens: 4096,
	},
	{
		id: "mistral-nemo",
		name: "Mistral Nemo",
		provider: "huggingface",
		modelId: "mistralai/Mistral-Nemo-Instruct-2407",
		description: "Modele Mistral compact et efficace",
		maxTokens: 4096,
	},
	{
		id: "phi-3-mini",
		name: "Phi-3 Mini",
		provider: "huggingface",
		modelId: "microsoft/Phi-3-mini-4k-instruct",
		description: "Petit modele Microsoft tres capable",
		maxTokens: 4096,
	},
	{
		id: "gemma-2-27b",
		name: "Gemma 2 27B",
		provider: "huggingface",
		modelId: "google/gemma-2-27b-it",
		description: "Modele Google open source",
		maxTokens: 4096,
	},
	{
		id: "gpt-4o",
		name: "GPT-4o",
		provider: "openai",
		modelId: "gpt-4o",
		description: "Le modele le plus intelligent d'OpenAI",
		maxTokens: 4096,
	},
	{
		id: "gpt-4o-mini",
		name: "GPT-4o Mini",
		provider: "openai",
		modelId: "gpt-4o-mini",
		description: "Modele OpenAI rapide et economique",
		maxTokens: 4096,
	},
	{
		id: "gemini-2.0-flash",
		name: "Gemini 2.0 Flash",
		provider: "gemini",
		modelId: "gemini-2.0-flash",
		description: "Modele Google ultra-rapide",
		maxTokens: 4096,
	},
	{
		id: "gemini-1.5-pro",
		name: "Gemini 1.5 Pro",
		provider: "gemini",
		modelId: "gemini-1.5-pro",
		description: "Modele Google tres performant",
		maxTokens: 8192,
	},
	{
		id: "claude-3-5-sonnet",
		name: "Claude 3.5 Sonnet",
		provider: "claude",
		modelId: "claude-3.5-sonnet-latest",
		description: "Le modele le plus capable d'Anthropic",
		maxTokens: 4096,
	},
];

export function getModelById(id: string): AIModel | undefined {
	return availableModels.find((m) => m.id === id);
}

export function getDefaultModel(): AIModel {
	return availableModels.find((m) => m.isDefault) || availableModels[0];
}
