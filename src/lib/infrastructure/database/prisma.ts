/**
 * Instance du client Prisma pour l'acces a la base de donnees
 * Utilise le pattern singleton pour eviter les connexions multiples en developpement
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
