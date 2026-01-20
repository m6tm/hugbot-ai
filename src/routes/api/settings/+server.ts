import { json } from "@sveltejs/kit";
import { encrypt } from "$lib/server/crypto";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

/**
 * GET /api/settings - Recupere les parametres de l'utilisateur
 */
export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const setting = await prisma.setting.findUnique({
		where: { userId: user.id },
	});

	if (!setting) {
		return json({
			temperature: 0.7,
			maxTokens: 1024,
			codeTheme: "tokyo-night",
			systemInstruction: "",
			isApiKeyConfigured: false,
		});
	}

	return json({
		temperature: setting.temperature,
		maxTokens: setting.maxTokens,
		codeTheme: setting.codeTheme,
		systemInstruction: setting.systemInstruction || "",
		isApiKeyConfigured: !!setting.apiKey,
	});
};

/**
 * PATCH /api/settings - Met a jour les parametres de l'utilisateur
 */
export const PATCH: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const body = await request.json();
	const updateData: Record<string, string | number | boolean | null> = {};

	if (body.apiKey !== undefined) {
		updateData.apiKey = body.apiKey ? encrypt(body.apiKey) : null;
	}
	if (body.temperature !== undefined) {
		updateData.temperature = body.temperature;
	}
	if (body.maxTokens !== undefined) {
		updateData.maxTokens = body.maxTokens;
	}
	if (body.codeTheme !== undefined) {
		updateData.codeTheme = body.codeTheme;
	}
	if (body.systemInstruction !== undefined) {
		updateData.systemInstruction = body.systemInstruction;
	}

	await prisma.setting.upsert({
		where: { userId: user.id },
		create: {
			userId: user.id,
			...updateData,
		},
		update: updateData,
	});

	return json({ success: true });
};
