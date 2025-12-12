/**
 * Service pour les notifications Telegram
 * Utilise les routes API proxy pour éviter les problèmes CORS
 */

import { get } from "svelte/store";
import { httpClient } from "$lib/infrastructure/http";
import { integrationsStore } from "$lib/stores";

interface TelegramConfig {
	enabled: boolean;
	botToken: string;
	chatId: string;
	sendOnNewMessage: boolean;
	sendOnError: boolean;
}

export class TelegramService {
	private static instance: TelegramService;
	private config: TelegramConfig | null = null;

	private constructor() {}

	public static getInstance(): TelegramService {
		if (!TelegramService.instance) {
			TelegramService.instance = new TelegramService();
		}
		return TelegramService.instance;
	}

	/**
	 * Initialise le service avec la configuration actuelle
	 */
	public async init(): Promise<void> {
		const integrations = get(integrationsStore);
		this.config = integrations.telegram;
	}

	/**
	 * Vérifie si Telegram est configuré et activé
	 */
	public isEnabled(): boolean {
		return (
			(this.config?.enabled ?? false) &&
			!!this.config?.botToken &&
			!!this.config?.chatId
		);
	}

	/**
	 * Envoie une notification générique via l'API proxy
	 */
	public async sendNotification(
		message: string,
		parseMode: "Markdown" | "HTML" = "Markdown",
	): Promise<boolean> {
		if (!this.isEnabled() || !this.config) {
			return false;
		}

		try {
			const { data } = await httpClient.post<{ ok: boolean }>(
				"/api/integrations/telegram/send",
				{
					botToken: this.config.botToken,
					chatId: this.config.chatId,
					message,
					parseMode,
				},
			);
			return data.ok;
		} catch (error) {
			console.error("Erreur lors de l'envoi de notification Telegram:", error);
			return false;
		}
	}

	/**
	 * Envoie une notification pour un nouveau message
	 */
	public async notifyNewMessage(
		userMessage: string,
		aiResponse: string,
	): Promise<boolean> {
		if (!this.config?.sendOnNewMessage) {
			return false;
		}

		const message = `🤖 *Nouvelle conversation ChatAI*

*Utilisateur:*
${this.escapeMarkdown(userMessage.substring(0, 200))}${
	userMessage.length > 200 ? "..." : ""
}

*Réponse IA:*
${this.escapeMarkdown(aiResponse.substring(0, 300))}${
	aiResponse.length > 300 ? "..." : ""
}`;

		return this.sendNotification(message);
	}

	/**
	 * Envoie une notification d'erreur
	 */
	public async notifyError(error: string, context?: string): Promise<boolean> {
		if (!this.config?.sendOnError) {
			return false;
		}

		const message = `❌ *Erreur ChatAI*

${
	context ? `*Contexte:* ${this.escapeMarkdown(context)}\n` : ""
}*Erreur:* ${this.escapeMarkdown(error)}

*Heure:* ${new Date().toLocaleString("fr-FR")}`;

		return this.sendNotification(message);
	}

	/**
	 * Envoie une notification de statut système
	 */
	public async notifySystemStatus(
		status: "online" | "offline" | "maintenance",
		message?: string,
	): Promise<boolean> {
		const statusEmoji = {
			online: "✅",
			offline: "🔴",
			maintenance: "🔧",
		};

		const statusText = {
			online: "En ligne",
			offline: "Hors ligne",
			maintenance: "Maintenance",
		};

		const notification = `${statusEmoji[status]} *ChatAI ${statusText[status]}*

${
	message
		? this.escapeMarkdown(message)
		: `Le système est maintenant ${statusText[status].toLowerCase()}.`
}

*Heure:* ${new Date().toLocaleString("fr-FR")}`;

		return this.sendNotification(notification);
	}

	/**
	 * Envoie des statistiques d'utilisation
	 */
	public async notifyUsageStats(stats: {
		totalMessages: number;
		totalConversations: number;
		activeUsers: number;
		period: string;
	}): Promise<boolean> {
		const message = `📊 *Statistiques ChatAI - ${this.escapeMarkdown(
			stats.period,
		)}*

• Messages envoyés: ${stats.totalMessages}
• Conversations: ${stats.totalConversations}
• Utilisateurs actifs: ${stats.activeUsers}

*Généré le:* ${new Date().toLocaleString("fr-FR")}`;

		return this.sendNotification(message);
	}

	/**
	 * Met à jour la configuration du service
	 */
	public updateConfig(newConfig: TelegramConfig): void {
		this.config = newConfig;
	}

	/**
	 * Teste la connexion avec un message simple
	 */
	public async testConnection(): Promise<boolean> {
		const message = "🔔 Test de connexion ChatAI - Intégration fonctionnelle !";
		return this.sendNotification(message);
	}

	/**
	 * Échappe les caractères spéciaux Markdown
	 */
	private escapeMarkdown(text: string): string {
		return text
			.replace(/\*/g, "\\*")
			.replace(/_/g, "\\_")
			.replace(/`/g, "\\`")
			.replace(/\[/g, "\\[");
	}
}

// Export d'une instance singleton
export const telegramService = TelegramService.getInstance();
