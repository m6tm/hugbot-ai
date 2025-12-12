import { env } from "$env/dynamic/private";
import { prisma } from "$lib/infrastructure/database/prisma";
import { inngest } from "../client";

/**
 * Crée une fonction Inngest "robuste" avec gestion automatique des retries et logging d'erreurs en base.
 * Surcharge la méthode createFunction standard.
 */
export const createRobustFunction = (
	options: Parameters<typeof inngest.createFunction>[0],
	trigger: Parameters<typeof inngest.createFunction>[1],
	handler: Parameters<typeof inngest.createFunction>[2],
) => {
	// Récupération de la config ou valeurs par défaut
	const maxRetries = env.INNGEST_MAX_RETRIES
		? parseInt(env.INNGEST_MAX_RETRIES, 10)
		: 5;

	// Fusion des options avec la stratégie de robustesse
	const robustOptions = {
		retries: maxRetries,
		// Handler executé après que toutes les tentatives aient échouées
		onFailure: async ({
			error,
			event,
			runId,
			attempt,
		}: {
			error: Error;
			// biome-ignore lint/suspicious/noExplicitAny: Dynamic event payload
			event: any;
			runId: string;
			attempt: number;
		}) => {
			console.error(
				`[Inngest] Function ${options.id} failed deeply after ${attempt} attempts.`,
				error,
			);

			try {
				// Enregistrement en base de données pour audit et rejouabilité
				await prisma.inngestError.create({
					data: {
						functionId: options.id,
						// L'event d'échec contient les données de l'event original dans event.data.event
						eventId: event?.data?.event?.id || runId,
						error: error.message || String(error),
						stack: error.stack,
						context: event, // Sauvegarde tout le contexte (event original, erreur, etc)
					},
				});
				console.log(`[Inngest] Error logged to DB for ${options.id}`);
			} catch (dbError) {
				// Fallback critique si la DB est down
				console.error(
					"[Inngest] CRITICAL: Failed to log error to DB!",
					dbError,
				);
			}
		},
		...options, // Les options passées manuellement peuvent surcharger les défauts si besoin
	};

	// Appel à la fonction originale avec les options enrichies
	// @ts-expect-error - Les types complexes d'Inngest peuvent être difficiles à satisfaire parfaitement dans un wrapper générique simple
	return inngest.createFunction(robustOptions, trigger, handler);
};
