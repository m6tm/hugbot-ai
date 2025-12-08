/**
 * Route API pour envoyer des messages Telegram
 * Sert de proxy pour éviter les problèmes CORS
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { botToken, chatId, message, parseMode = "Markdown" } = await request.json();

    if (!botToken) {
      return json(
        { ok: false, error: "Token du bot manquant" },
        { status: 400 }
      );
    }

    if (!chatId) {
      return json(
        { ok: false, error: "Chat ID manquant" },
        { status: 400 }
      );
    }

    if (!message) {
      return json(
        { ok: false, error: "Message manquant" },
        { status: 400 }
      );
    }

    // Appel à l'API Telegram pour envoyer le message
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: parseMode,
        }),
      }
    );

    const data = await response.json();

    if (data.ok) {
      return json({
        ok: true,
        messageId: data.result.message_id,
        chat: {
          id: data.result.chat.id,
          type: data.result.chat.type,
        },
      });
    } else {
      return json(
        {
          ok: false,
          error: data.description || "Échec de l'envoi du message",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message Telegram:", error);
    return json(
      {
        ok: false,
        error: (error as Error).message || "Erreur de connexion",
      },
      { status: 500 }
    );
  }
};
