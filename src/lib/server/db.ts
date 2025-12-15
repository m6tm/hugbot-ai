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

	// Setting operations
	setting: {
		findUnique: (args: Prisma.SettingFindUniqueArgs) =>
			prisma.setting.findUnique(args),
		create: (args: Prisma.SettingCreateArgs) => prisma.setting.create(args),
		update: (args: Prisma.SettingUpdateArgs) => prisma.setting.update(args),
		upsert: (args: Prisma.SettingUpsertArgs) => prisma.setting.upsert(args),
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
		findUnique: (args: Prisma.MessageFindUniqueArgs) =>
			prisma.message.findUnique(args),
		deleteMany: (args: Prisma.MessageDeleteManyArgs) =>
			prisma.message.deleteMany(args),
	},
};

export default prisma;
