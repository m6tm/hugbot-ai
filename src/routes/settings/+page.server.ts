import { fail, redirect } from "@sveltejs/kit";
import { decrypt, encrypt } from "$lib/server/crypto";
import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		throw redirect(303, "/");
	}

	// Fetch or create settings for the user
	let setting = await db.setting.findUnique({
		where: { userId: user.id },
	});

	if (!setting) {
		setting = await db.setting.create({
			data: {
				userId: user.id,
				// Check if old user key exists and migrate it?
				// For simplicity, we start fresh or user re-enters.
				// Actually, helpful to migrate if exists.
			},
		});
	}

	// Decrypt keys for client usage (be careful here, but user needs to see/edit them?)
	// Usually we send back placeholders if we don't want to expose, but for a settings page
	// where they can edit, often we send it back or empty if they want to change.
	// The current UI binds `apiKey`.
	let decryptedApiKey = "";
	if (setting.apiKey) {
		try {
			decryptedApiKey = decrypt(setting.apiKey);
		} catch (_e) {
			// If decryption fails (maybe it wasn't encrypted legacy data), return raw or empty
			decryptedApiKey = setting.apiKey;
		}
	}

	let decryptedTelegramToken = "";
	if (setting.telegramBotToken) {
		try {
			decryptedTelegramToken = decrypt(setting.telegramBotToken);
		} catch (_e) {
			decryptedTelegramToken = setting.telegramBotToken || "";
		}
	}

	return {
		settings: {
			...setting,
			apiKey: decryptedApiKey,
			telegramBotToken: decryptedTelegramToken,
		},
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session || !user) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await request.formData();
		const section = formData.get("section") as string;

		const updateData: Record<
			string,
			string | number | boolean | null | undefined
		> = {};

		if (section === "appearance") {
			updateData.codeTheme = formData.get("codeTheme") as string;
		} else if (section === "ai") {
			const apiKey = formData.get("apiKey") as string;
			const temperature = parseFloat(formData.get("temperature") as string);
			const maxTokens = parseInt(formData.get("maxTokens") as string, 10);

			if (apiKey) {
				updateData.apiKey = encrypt(apiKey);
			}
			updateData.temperature = temperature;
			updateData.maxTokens = maxTokens;
		} else if (section === "system") {
			updateData.systemInstruction = formData.get(
				"systemInstruction",
			) as string;
		} else if (section === "integrations") {
			const telegramEnabled = formData.get("telegramEnabled") === "true";
			const telegramBotToken = formData.get("telegramBotToken") as string;
			const telegramChatId = formData.get("telegramChatId") as string;
			const telegramSendOnNewMessage =
				formData.get("telegramSendOnNewMessage") === "true";
			const telegramSendOnError =
				formData.get("telegramSendOnError") === "true";

			updateData.telegramEnabled = telegramEnabled;
			if (telegramBotToken) {
				updateData.telegramBotToken = encrypt(telegramBotToken);
			}
			updateData.telegramChatId = telegramChatId;
			updateData.telegramSendOnNewMessage = telegramSendOnNewMessage;
			updateData.telegramSendOnError = telegramSendOnError;
		}

		try {
			await db.setting.upsert({
				where: { userId: user.id },
				create: {
					userId: user.id,
					...updateData,
				},
				update: updateData,
			});

			return { success: true, section };
		} catch (error) {
			console.error("Error saving settings:", error);
			return fail(500, { message: "Failed to save settings" });
		}
	},
};
