import { Inngest } from "inngest";

/**
 * Initialisation du client Inngest pour l'application HugBot.
 * Ce client est utilisé pour définir et envoyer des évènements
 * vers la plateforme Inngest.
 */
export const inngest = new Inngest({
	id: "hugbot",
	name: "HugBot",
});
