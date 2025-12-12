/**
 * Store pour gérer les intégrations avec des systèmes externes
 */

import { writable } from "svelte/store";
import { db, isIndexedDBAvailable } from "$lib/infrastructure/database/db";
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

const INTEGRATIONS_ID = "integrations_settings";

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

async function loadIntegrations(): Promise<IntegrationsState> {
	if (!isIndexedDBAvailable()) {
		return getDefaultIntegrations();
	}

	try {
		const stored = await db.settings.get(INTEGRATIONS_ID);
		if (stored) {
			return {
				telegram: {
					enabled: stored.telegram?.enabled || false,
					botToken: stored.telegram?.botToken || "",
					chatId: stored.telegram?.chatId || "",
					sendOnNewMessage: stored.telegram?.sendOnNewMessage ?? true,
					sendOnError: stored.telegram?.sendOnError ?? true,
				},
			};
		}

		const defaults = getDefaultIntegrations();
		await saveIntegrations(defaults);
		return defaults;
	} catch (error) {
		console.error("Erreur lors du chargement des intégrations:", error);
		return getDefaultIntegrations();
	}
}

async function saveIntegrations(state: IntegrationsState): Promise<void> {
	if (!isIndexedDBAvailable()) return;

	await db.settings.put({
		id: INTEGRATIONS_ID,
		telegram: state.telegram,
	});
}

function createIntegrationsStore() {
	const { subscribe, set, update } = writable<IntegrationsState>(
		getDefaultIntegrations(),
	);

	return {
		subscribe,

		/**
		 * Initialise le store depuis IndexedDB
		 */
		async init() {
			const integrations = await loadIntegrations();
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
			await saveIntegrations(defaultIntegrations);
		},
	};
}

export const integrationsStore = createIntegrationsStore();
