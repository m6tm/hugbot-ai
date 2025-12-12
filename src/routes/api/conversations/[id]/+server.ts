import { db } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});
	}

	const { id } = params;

	try {
		const conversation = await db.conversation.findUnique({
			where: { id, userId: user.id },
			include: {
				messages: {
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!conversation) {
			return new Response(JSON.stringify({ error: "Conversation not found" }), {
				status: 404,
			});
		}

		return new Response(JSON.stringify(conversation), {
			headers: { "Content-Type": "application/json" },
		});
	} catch (error) {
		console.error("Error fetching conversation:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user)
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});

	try {
		await db.conversation.delete({
			where: { id: params.id, userId: user.id },
		});
		return new Response(JSON.stringify({ success: true }));
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Failed to delete" }), {
			status: 500,
		});
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	const { session, user } = await locals.safeGetSession();
	if (!session || !user)
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
		});

	const { title } = await request.json();

	try {
		await db.conversation.update({
			where: { id: params.id, userId: user.id },
			data: { title },
		});
		return new Response(JSON.stringify({ success: true }));
	} catch (_error) {
		return new Response(JSON.stringify({ error: "Failed to update" }), {
			status: 500,
		});
	}
};
