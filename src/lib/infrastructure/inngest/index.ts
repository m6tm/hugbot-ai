import { helloWorld } from "./functions/hello";
import { syncChats } from "./functions/sync-chats";
import { syncSettings } from "./functions/sync-settings";

/**
 * Liste de toutes les fonctions Inngest de l'application.
 * Ces fonctions doivent être passées au gestionnaire de requêtes (handler)
 * dans la route API.
 */
export const functions = [helloWorld, syncChats, syncSettings];

export { inngest } from "./client";
export { createRobustFunction } from "./utils/create-robust-function";
