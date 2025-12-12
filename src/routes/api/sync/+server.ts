import { json } from "@sveltejs/kit";
import { inngest } from "$lib/infrastructure/inngest/client";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	const { conversations } = await request.json();

	if (!conversations || !Array.isArray(conversations)) {
		return json({ error: "Invalid data" }, { status: 400 });
	}

	// Trigger Inngest event
	await inngest.send({
		name: "app/chat.sync",
		data: {
			userId: user.id,
			conversations,
		},
	});

	return json({ success: true, count: conversations.length });
};
