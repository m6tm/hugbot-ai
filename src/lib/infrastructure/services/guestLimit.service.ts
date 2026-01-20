/**
 * Service de gestion des limites d'utilisation pour les utilisateurs non connectés
 * Utilise l'adresse IP combinée avec un fingerprint pour identifier les utilisateurs
 */

import prisma from "$lib/server/db";

const MAX_GUEST_MESSAGES = 10;
const RESET_INTERVAL_HOURS = 24;

/**
 * Vérifie si un invité peut encore envoyer des messages
 * @param ip - Adresse IP de l'utilisateur
 * @returns true si l'utilisateur peut envoyer un message, false sinon
 */
export async function canGuestSendMessage(ip: string): Promise<boolean> {
	const guestLimit = await prisma.guestLimit.findUnique({
		where: { ip },
	});

	if (!guestLimit) {
		return true;
	}

	const now = new Date();
	const hoursSinceReset =
		(now.getTime() - guestLimit.lastReset.getTime()) / (1000 * 60 * 60);

	if (hoursSinceReset >= RESET_INTERVAL_HOURS) {
		return true;
	}

	return guestLimit.count < MAX_GUEST_MESSAGES;
}

/**
 * Incrémente le compteur de messages pour un invité
 * @param ip - Adresse IP de l'utilisateur
 */
export async function incrementGuestMessageCount(ip: string): Promise<void> {
	const now = new Date();

	const existing = await prisma.guestLimit.findUnique({
		where: { ip },
	});

	if (!existing) {
		await prisma.guestLimit.create({
			data: {
				ip,
				count: 1,
				lastReset: now,
			},
		});
		return;
	}

	const hoursSinceReset =
		(now.getTime() - existing.lastReset.getTime()) / (1000 * 60 * 60);

	if (hoursSinceReset >= RESET_INTERVAL_HOURS) {
		await prisma.guestLimit.update({
			where: { ip },
			data: {
				count: 1,
				lastReset: now,
			},
		});
	} else {
		await prisma.guestLimit.update({
			where: { ip },
			data: {
				count: existing.count + 1,
			},
		});
	}
}

/**
 * Récupère le nombre de messages restants pour un invité
 * @param ip - Adresse IP de l'utilisateur
 * @returns Le nombre de messages restants
 */
export async function getRemainingGuestMessages(ip: string): Promise<number> {
	const guestLimit = await prisma.guestLimit.findUnique({
		where: { ip },
	});

	if (!guestLimit) {
		return MAX_GUEST_MESSAGES;
	}

	const now = new Date();
	const hoursSinceReset =
		(now.getTime() - guestLimit.lastReset.getTime()) / (1000 * 60 * 60);

	if (hoursSinceReset >= RESET_INTERVAL_HOURS) {
		return MAX_GUEST_MESSAGES;
	}

	return Math.max(0, MAX_GUEST_MESSAGES - guestLimit.count);
}
