import { json } from "@sveltejs/kit";
import prisma from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session || !user) {
		return json({ error: "Unauthorized" }, { status: 401 });
	}

	// Recupere toutes les conversations de l'utilisateur avec leurs messages
	const conversations = await prisma.conversation.findMany({
		where: { userId: user.id },
		orderBy: { updatedAt: "desc" },
		include: {
			messages: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	// Transforme les donnees pour correspondre au format Conversation local
	const formattedConversations = conversations.map((conv) => ({
		id: conv.id,
		title: conv.title,
		createdAt: conv.createdAt,
		updatedAt: conv.updatedAt,
		isActive: true,
		messages: conv.messages.map((msg) => ({
			id: msg.id,
			conversationId: msg.conversationId,
			role: msg.role as "user" | "assistant" | "system",
			content: msg.content,
			createdAt: msg.createdAt,
		})),
	}));

	return json(formattedConversations);
};
