/**
 * Route API pour tester la connexion Telegram
 * Sert de proxy pour éviter les problèmes CORS
 */

import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { botToken } = await request.json();

    if (!botToken) {
      return json(
        { ok: false, error: "Token du bot manquant" },
        { status: 400 }
      );
    }

    // Appel à l'API Telegram pour vérifier le bot
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (data.ok) {
      return json({
        ok: true,
        bot: {
          id: data.result.id,
          username: data.result.username,
          firstName: data.result.first_name,
        },
      });
    } else {
      return json(
        {
          ok: false,
          error: data.description || "Bot invalide",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Erreur lors du test Telegram:", error);
    return json(
      {
        ok: false,
        error: (error as Error).message || "Erreur de connexion",
      },
      { status: 500 }
    );
  }
};
