import { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";

// DELETE /api/conversations/[id]/messages?fromId=...
export const DELETE: RequestHandler = async ({ params, url, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user)
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});

	const fromId = url.searchParams.get("fromId");
	if (!fromId) {
		return new Response(JSON.stringify({ error: "fromId required" }), {
			status: 400,
		});
	}

	const conversationId = params.id;

	try {
		// We need to find the creation date of the message to delete "everything after"
		const targetMsg = await db.message.findUnique({
			where: { id: fromId, conversationId },
		});

		if (!targetMsg) {
			return new Response(JSON.stringify({ error: "Message not found" }), {
				status: 404,
			});
		}

		// Delete target message and all subsequent messages in this conversation
		await db.message.deleteMany({
			where: {
				conversationId,
				createdAt: {
					gte: targetMsg.createdAt,
				},
			},
		});

		return new Response(JSON.stringify({ success: true }));
	} catch (error) {
		console.error("Rewind error", error);
		return new Response(JSON.stringify({ error: "Failed to rewind" }), {
			status: 500,
		});
	}
};
