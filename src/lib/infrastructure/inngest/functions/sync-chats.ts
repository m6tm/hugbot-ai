import prisma from "$lib/server/db";
import { inngest } from "../client";

interface SyncEvent {
	name: "app/chat.sync";
	data: {
		userId: string;
		conversations: Array<{
			id: string;
			title: string;
			createdAt: string | Date; // Dexie might send stringified dates
			updatedAt: string | Date;
			messages: Array<{
				id: string;
				role: "user" | "assistant" | "system";
				content: string;
				createdAt: string | Date;
			}>;
		}>;
	};
}

export const syncChats = inngest.createFunction(
	{ id: "sync-chats" },
	{ event: "app/chat.sync" },
	async ({ event, step }) => {
		const { userId, conversations } = event.data as SyncEvent["data"];

		if (!userId || !conversations || conversations.length === 0) {
			return { status: "skipped", message: "No data to sync" };
		}

		const result = await step.run("sync-to-db", async () => {
			let syncedCount = 0;

			for (const conv of conversations) {
				// 1. Upsert Conversation
				await prisma.conversation.upsert({
					where: { id: conv.id },
					update: {
						title: conv.title,
						updatedAt: new Date(conv.updatedAt),
					},
					create: {
						id: conv.id,
						title: conv.title,
						userId: userId,
						createdAt: new Date(conv.createdAt),
						updatedAt: new Date(conv.updatedAt),
					},
				});

				// 2. Sync Messages
				// Strategy: Delete existing messages for this conversation and re-insert local ones
				// This handles edits and deletions cleanly if local is source of truth during sync
				await prisma.message.deleteMany({
					where: { conversationId: conv.id },
				});

				if (conv.messages.length > 0) {
					await prisma.message.createMany({
						data: conv.messages.map((msg) => ({
							id: msg.id,
							conversationId: conv.id,
							role: msg.role,
							content: msg.content,
							createdAt: new Date(msg.createdAt),
						})),
					});
				}

				syncedCount++;
			}

			return { synced: syncedCount };
		});

		return { status: "success", count: result.synced };
	},
);
