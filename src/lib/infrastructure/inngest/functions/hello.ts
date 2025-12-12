import { createRobustFunction } from "../utils/create-robust-function";

/**
 * Fonction de test "Hello World".
 * Cette fonction est déclenchée par l'évènement 'test/hello.world'.
 * Elle sert à vérifier que l'intégration d'Inngest fonctionne correctement.
 */
export const helloWorld = createRobustFunction(
	{ id: "hello-world" },
	{ event: "test/hello.world" },
	async ({ event, step }) => {
		await step.sleep("wait-a-sec", "1s");

		return {
			message: `Hello ${event.data.name || "World"}!`,
			timestamp: Date.now(),
		};
	},
);
