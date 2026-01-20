import { helloWorld } from "./functions/hello";

/**
 * Liste de toutes les fonctions Inngest de l'application.
 * Ces fonctions doivent être passées au gestionnaire de requêtes (handler)
 * dans la route API.
 */
export const functions = [helloWorld];

export { inngest } from "./client";
export { createRobustFunction } from "./utils/create-robust-function";
