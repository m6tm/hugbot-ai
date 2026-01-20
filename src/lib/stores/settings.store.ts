/**
 * Store pour gerer les modeles et parametres AI
 * Utilise uniquement la base de donnees en ligne (via API)
 */

import { get, writable } from "svelte/store";
import {
	type AIModel,
	availableModels,
	getDefaultModel,
	getModelById,
} from "$lib/config/models";
import { httpClient } from "$lib/infrastructure/http";

interface SettingsState {
	currentModelId: string;
	apiKey: string;
	temperature: number;
	maxTokens: number;
	codeTheme: string;
	systemInstruction: string;
	isApiKeyConfigured: boolean;
}

function getDefaultSettings(): SettingsState {
	return {
		currentModelId: getDefaultModel().id,
		apiKey: "",
		temperature: 0.7,
		maxTokens: 1024,
		codeTheme: "tokyo-night",
		systemInstruction: "",
		isApiKeyConfigured: false,
	};
}

/**
 * Sauvegarde les parametres sur le serveur (non-bloquant)
 */
function saveSettingsToServer(
	data: Partial<Omit<SettingsState, "isApiKeyConfigured">>,
): void {
	httpClient.patch("/api/settings", data).catch((error) => {
		console.error("Erreur lors de la sauvegarde des parametres:", error);
	});
}

function createSettingsStore() {
	const { subscribe, set, update } = writable<SettingsState>(
		getDefaultSettings(),
	);

	return {
		subscribe,

		/**
		 * Initialise le store depuis le serveur
		 */
		async init() {
			try {
				const { data } = await httpClient.get<{
					temperature: number;
					maxTokens: number;
					codeTheme: string;
					systemInstruction: string;
					isApiKeyConfigured: boolean;
				}>("/api/settings");

				update((state) => ({
					...state,
					temperature: data.temperature ?? 0.7,
					maxTokens: data.maxTokens ?? 1024,
					codeTheme: data.codeTheme || "tokyo-night",
					systemInstruction: data.systemInstruction || "",
					isApiKeyConfigured: data.isApiKeyConfigured,
				}));
			} catch (error) {
				console.error("Erreur lors du chargement des parametres:", error);
			}
		},

		/**
		 * Change le modele actif
		 */
		setModel(modelId: string) {
			const model = getModelById(modelId);
			if (!model) return;

			update((state) => {
				const newState = { ...state, currentModelId: modelId };
				return newState;
			});
		},

		/**
		 * Configure la cle API
		 */
		setApiKey(apiKey: string) {
			update((state) => {
				const newState = {
					...state,
					apiKey,
					isApiKeyConfigured: !!apiKey,
				};
				saveSettingsToServer({ apiKey });
				return newState;
			});
		},

		/**
		 * Met a jour la temperature
		 */
		setTemperature(temperature: number) {
			update((state) => {
				const newState = { ...state, temperature };
				saveSettingsToServer({ temperature });
				return newState;
			});
		},

		/**
		 * Met a jour le max tokens
		 */
		setMaxTokens(maxTokens: number) {
			update((state) => {
				const newState = { ...state, maxTokens };
				saveSettingsToServer({ maxTokens });
				return newState;
			});
		},

		/**
		 * Met a jour le theme du code
		 */
		setCodeTheme(codeTheme: string) {
			update((state) => {
				const newState = { ...state, codeTheme };
				saveSettingsToServer({ codeTheme });
				return newState;
			});
		},

		/**
		 * Met a jour l'instruction systeme
		 */
		setSystemInstruction(systemInstruction: string) {
			update((state) => {
				const newState = { ...state, systemInstruction };
				saveSettingsToServer({ systemInstruction });
				return newState;
			});
		},

		/**
		 * Recupere le modele actuel
		 */
		getCurrentModel(): AIModel {
			const state = get({ subscribe });
			return getModelById(state.currentModelId) || getDefaultModel();
		},

		/**
		 * Recupere tous les modeles disponibles
		 */
		getAvailableModels(): AIModel[] {
			return availableModels;
		},

		/**
		 * Reset les parametres
		 */
		async reset() {
			const defaultSettings = getDefaultSettings();
			set(defaultSettings);
			saveSettingsToServer({
				temperature: defaultSettings.temperature,
				maxTokens: defaultSettings.maxTokens,
				codeTheme: defaultSettings.codeTheme,
				systemInstruction: defaultSettings.systemInstruction,
			});
		},
	};
}

export const settingsStore = createSettingsStore();
