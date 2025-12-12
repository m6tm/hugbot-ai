import { serve } from "inngest/sveltekit";
import { functions, inngest } from "$lib/infrastructure/inngest";

/**
 * Handler pour la route API Inngest.
 * Ce handler expose les fonctions définies à la plateforme Inngest
 * et gère l'exécution des étapes.
 */
const handler = serve({
	client: inngest,
	functions,
});

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;
