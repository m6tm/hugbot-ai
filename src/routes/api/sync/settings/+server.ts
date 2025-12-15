import { json } from "@sveltejs/kit";
import { inngest } from "$lib/infrastructure/inngest/client";
import type { RequestHandler } from "./$types";

interface SettingsSyncPayload {
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

/**
 * API endpoint pour déclencher la synchronisation des paramètres vers Supabase via Inngest.
 * Cette route est appelée après la sauvegarde locale dans DexieJS.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const settings: SettingsSyncPayload = await request.json();

	if (!settings || !settings.section) {
		return json(
			{ error: "Invalid data: section is required" },
			{ status: 400 },
		);
	}

	const validSections = ["appearance", "ai", "system", "integrations"];
	if (!validSections.includes(settings.section)) {
		return json({ error: "Invalid section" }, { status: 400 });
	}

	await inngest.send({
		name: "app/settings.sync",
		data: {
			userId: user.id,
			settings,
		},
	});

	return json({ success: true, section: settings.section });
};
