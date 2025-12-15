import { encrypt } from "$lib/server/crypto";
import prisma from "$lib/server/db";
import { inngest } from "../client";

interface SettingsSyncData {
	section: "appearance" | "ai" | "system" | "integrations";
	codeTheme?: string;
	apiKey?: string;
	temperature?: number;
	maxTokens?: number;
	systemInstruction?: string;
	telegramEnabled?: boolean;
	telegramBotToken?: string;
	telegramChatId?: string;
	telegramSendOnNewMessage?: boolean;
	telegramSendOnError?: boolean;
}

interface SyncSettingsEvent {
	name: "app/settings.sync";
	data: {
		userId: string;
		settings: SettingsSyncData;
	};
}

/**
 * Fonction Inngest pour synchroniser les paramètres utilisateur vers Supabase.
 * Déclenchée après la sauvegarde locale dans DexieJS.
 */
export const syncSettings = inngest.createFunction(
	{ id: "sync-settings" },
	{ event: "app/settings.sync" },
	async ({ event, step }) => {
		const { userId, settings } = event.data as SyncSettingsEvent["data"];

		if (!userId || !settings) {
			return { status: "skipped", message: "No data to sync" };
		}

		const result = await step.run("sync-settings-to-db", async () => {
			const updateData: Record<
				string,
				string | number | boolean | null | undefined
			> = {};

			if (settings.section === "appearance") {
				if (settings.codeTheme !== undefined) {
					updateData.codeTheme = settings.codeTheme;
				}
			} else if (settings.section === "ai") {
				if (settings.apiKey) {
					updateData.apiKey = encrypt(settings.apiKey);
				}
				if (settings.temperature !== undefined) {
					updateData.temperature = settings.temperature;
				}
				if (settings.maxTokens !== undefined) {
					updateData.maxTokens = settings.maxTokens;
				}
			} else if (settings.section === "system") {
				if (settings.systemInstruction !== undefined) {
					updateData.systemInstruction = settings.systemInstruction;
				}
			} else if (settings.section === "integrations") {
				if (settings.telegramEnabled !== undefined) {
					updateData.telegramEnabled = settings.telegramEnabled;
				}
				if (settings.telegramBotToken) {
					updateData.telegramBotToken = encrypt(settings.telegramBotToken);
				}
				if (settings.telegramChatId !== undefined) {
					updateData.telegramChatId = settings.telegramChatId;
				}
				if (settings.telegramSendOnNewMessage !== undefined) {
					updateData.telegramSendOnNewMessage =
						settings.telegramSendOnNewMessage;
				}
				if (settings.telegramSendOnError !== undefined) {
					updateData.telegramSendOnError = settings.telegramSendOnError;
				}
			}

			if (Object.keys(updateData).length === 0) {
				return { updated: false, reason: "No fields to update" };
			}

			await prisma.setting.upsert({
				where: { userId },
				create: {
					userId,
					...updateData,
				},
				update: updateData,
			});

			return { updated: true, section: settings.section };
		});

		return { status: "success", ...result };
	},
);
