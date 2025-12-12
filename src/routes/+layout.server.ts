import { db } from "$lib/server/db";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({
	locals: { safeGetSession },
	cookies,
}) => {
	const { session, user } = await safeGetSession();

	// biome-ignore lint/suspicious/noExplicitAny: Temporary fix for rapid prototyping
	let conversations: any[] = [];

	if (session && user) {
		conversations = await db.conversation.findMany({
			where: { userId: user.id },
			orderBy: { updatedAt: "desc" },
			include: {
				messages: {
					take: 1,
					orderBy: { createdAt: "desc" },
					select: { content: true }, // Preview maybe?
				},
			},
		});
	}

	return {
		session,
		conversations,
		cookies: cookies.getAll(),
	};
};
