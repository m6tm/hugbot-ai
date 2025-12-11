import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

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
	const { session } = await locals.safeGetSession();

	if (!session) {
		throw redirect(303, "/");
	}

	return {};
};
