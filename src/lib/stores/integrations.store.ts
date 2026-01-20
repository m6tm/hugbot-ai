/**
 * Store pour gérer les intégrations avec des systèmes externes
 * Utilise localStorage pour le stockage local des préférences
 */

import { writable } from "svelte/store";
import { httpClient } from "$lib/infrastructure/http";

export interface TelegramIntegration {
	enabled: boolean;
	botToken: string;
	chatId: string;
	sendOnNewMessage: boolean;
	sendOnError: boolean;
}

export interface IntegrationsState {
	telegram: TelegramIntegration;
}

const INTEGRATIONS_KEY = "hugbot_integrations";

function getDefaultIntegrations(): IntegrationsState {
	return {
		telegram: {
			enabled: false,
			botToken: "",
			chatId: "",
			sendOnNewMessage: true,
			sendOnError: true,
		},
	};
}

function isLocalStorageAvailable(): boolean {
	if (typeof window === "undefined") return false;
	try {
		const test = "__storage_test__";
		window.localStorage.setItem(test, test);
		window.localStorage.removeItem(test);
		return true;
	} catch {
		return false;
	}
}

function loadIntegrations(): IntegrationsState {
	if (!isLocalStorageAvailable()) {
		return getDefaultIntegrations();
	}

	try {
		const stored = localStorage.getItem(INTEGRATIONS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return {
				telegram: {
					enabled: parsed.telegram?.enabled || false,
					botToken: parsed.telegram?.botToken || "",
					chatId: parsed.telegram?.chatId || "",
					sendOnNewMessage: parsed.telegram?.sendOnNewMessage ?? true,
					sendOnError: parsed.telegram?.sendOnError ?? true,
				},
			};
		}
		return getDefaultIntegrations();
	} catch (error) {
		console.error("Erreur lors du chargement des intégrations:", error);
		return getDefaultIntegrations();
	}
}

function saveIntegrations(state: IntegrationsState): void {
	if (!isLocalStorageAvailable()) return;

	try {
		localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(state));
	} catch (error) {
		console.error("Erreur lors de la sauvegarde des intégrations:", error);
	}
}

function createIntegrationsStore() {
	const { subscribe, set, update } = writable<IntegrationsState>(
		getDefaultIntegrations(),
	);

	return {
		subscribe,

		/**
		 * Initialise le store depuis localStorage
		 */
		async init() {
			const integrations = loadIntegrations();
			set(integrations);
		},

		/**
		 * Configure l'intégration Telegram
		 */
		setTelegramConfig(config: Partial<TelegramIntegration>) {
			update((state) => {
				const newState = {
					...state,
					telegram: { ...state.telegram, ...config },
				};
				saveIntegrations(newState);
				return newState;
			});
		},

		/**
		 * Active/désactive l'intégration Telegram
		 */
		toggleTelegram(enabled: boolean) {
			update((state) => {
				const newState = {
					...state,
					telegram: { ...state.telegram, enabled },
				};
				saveIntegrations(newState);
				return newState;
			});
		},

		/**
		 * Test la connexion Telegram via l'API proxy
		 */
		async testTelegramConnection(
			botToken: string,
		): Promise<{ ok: boolean; bot?: { username: string }; error?: string }> {
			try {
				const { data } = await httpClient.post<{
					ok: boolean;
					bot?: { username: string };
					error?: string;
				}>("/api/integrations/telegram/test", { botToken });
				return data;
			} catch (error) {
				console.error("Erreur lors du test de connexion Telegram:", error);
				return { ok: false, error: (error as Error).message };
			}
		},

		/**
		 * Envoie un message de test via Telegram (via l'API proxy)
		 */
		async sendTelegramTestMessage(
			botToken: string,
			chatId: string,
		): Promise<{ ok: boolean; error?: string }> {
			try {
				const message =
					"Test de connexion ChatAI - Integration fonctionnelle !";
				const { data } = await httpClient.post<{ ok: boolean; error?: string }>(
					"/api/integrations/telegram/send",
					{ botToken, chatId, message, parseMode: "Markdown" },
				);
				return data;
			} catch (error) {
				console.error("Erreur lors de l'envoi du message test:", error);
				return { ok: false, error: (error as Error).message };
			}
		},

		/**
		 * Reset les intégrations
		 */
		async reset() {
			const defaultIntegrations = getDefaultIntegrations();
			set(defaultIntegrations);
			saveIntegrations(defaultIntegrations);
		},
	};
}

export const integrationsStore = createIntegrationsStore();
