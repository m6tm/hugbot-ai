import { fail, redirect } from "@sveltejs/kit";
import { encrypt } from "$lib/server/crypto";
import { db } from "$lib/server/db";
import type { Actions, PageServerLoad } from "./$types";

/**
 * Charge les données pour la page de paramètres.
 * Vérifie si l'utilisateur est authentifié avant d'autoriser l'accès.
 * Redirige vers la page d'authentification si aucune session n'est trouvée.
 *
 * @param {Object} context - Le contexte de chargement de SvelteKit.
 * @param {App.Locals} context.locals - Les variables locales contenant la session.
 * @returns {Promise<void>} Renvoie un objet vide si l'utilisateur est authentifié.
 * @throws {Redirect} Redirige vers '/auth' si l'utilisateur n'est pas connecté.
 */
export const load: PageServerLoad = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, "/");
	}

	// Retrieve existing key if present (don't send full key back to client usually, maybe just a placeholder)
	const userData = await db.user.findUnique({
		where: { id: user?.id },
		select: { huggingFaceKey: true },
	});

	return {
		hasKey: !!userData?.huggingFaceKey,
	};
};

export const actions: Actions = {
	saveKey: async ({ request, locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session) {
			return fail(401, { message: "Unauthorized" });
		}

		const formData = await request.formData();
		const apiKey = formData.get("apiKey") as string;

		if (!apiKey) {
			return fail(400, { message: "API Key is required" });
		}

		try {
			const encryptedKey = encrypt(apiKey);
			await db.user.update({
				where: { id: user?.id },
				data: { huggingFaceKey: encryptedKey },
			});

			return { success: true };
		} catch (error) {
			console.error("Error saving key:", error);
			return fail(500, { message: "Failed to save key" });
		}
	},

	deleteKey: async ({ locals }) => {
		const { session, user } = await locals.safeGetSession();
		if (!session) {
			return fail(401, { message: "Unauthorized" });
		}

		try {
			await db.user.update({
				where: { id: user?.id },
				data: { huggingFaceKey: null },
			});
			return { success: true };
		} catch (error) {
			console.error("Error removing key:", error);
			return fail(500, { message: "Failed to remove key" });
		}
	},
};
