import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const db = {
	// User operations
	user: {
		findUnique: (args: Prisma.UserFindUniqueArgs) =>
			prisma.user.findUnique(args),
		create: (args: Prisma.UserCreateArgs) => prisma.user.create(args),
		update: (args: Prisma.UserUpdateArgs) => prisma.user.update(args),
	},

	// Conversation operations
	conversation: {
		findMany: (args: Prisma.ConversationFindManyArgs) =>
			prisma.conversation.findMany(args),
		findUnique: (args: Prisma.ConversationFindUniqueArgs) =>
			prisma.conversation.findUnique(args),
		create: (args: Prisma.ConversationCreateArgs) =>
			prisma.conversation.create(args),
		update: (args: Prisma.ConversationUpdateArgs) =>
			prisma.conversation.update(args),
		delete: (args: Prisma.ConversationDeleteArgs) =>
			prisma.conversation.delete(args),
	},

	// Message operations
	message: {
		create: (args: Prisma.MessageCreateArgs) => prisma.message.create(args),
		createMany: (args: Prisma.MessageCreateManyArgs) =>
			prisma.message.createMany(args),
		findMany: (args: Prisma.MessageFindManyArgs) =>
			prisma.message.findMany(args),
	},
};

export default prisma;
