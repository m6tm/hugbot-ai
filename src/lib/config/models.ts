/**
 * Configuration des modeles AI disponibles
 */

export interface AIModel {
  id: string;
  name: string;
  provider: "huggingface" | "openai" | "mock";
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
];

export function getModelById(id: string): AIModel | undefined {
  return availableModels.find((m) => m.id === id);
}

export function getDefaultModel(): AIModel {
  return availableModels.find((m) => m.isDefault) || availableModels[0];
}
