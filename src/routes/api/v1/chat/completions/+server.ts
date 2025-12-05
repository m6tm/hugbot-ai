/**
 * Route API compatible OpenAI SDK
 * Endpoint: POST /api/v1/chat/completions
 * Peut etre utilise comme baseURL avec le SDK OpenAI
 * Supporte le streaming SSE
 */

import type { RequestHandler } from "./$types";
import { env } from "$env/dynamic/private";
import { OpenAI } from "openai";
import { availableModels, getDefaultModel } from "$lib/config/models";

interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface OpenAIChatRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
}

interface OpenAIChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

interface OpenAIChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

function generateId(): string {
  return "chatcmpl-" + Math.random().toString(36).substring(2, 15);
}

function resolveModel(modelInput: string): string {
  const model = availableModels.find(
    (m) => m.id === modelInput || m.modelId === modelInput
  );
  if (model) {
    return model.modelId;
  }
  return modelInput;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body: OpenAIChatRequest = await request.json();
    const {
      model,
      messages,
      temperature = 0.7,
      max_tokens = 1024,
      stream = false,
    } = body;

    // Recupere la cle API depuis l'en-tete Authorization
    const authHeader = request.headers.get("Authorization");
    let apiKey = "";

    if (authHeader?.startsWith("Bearer ")) {
      apiKey = authHeader.slice(7);
    }

    // Si pas de cle dans le header, utilise celle du serveur
    const effectiveApiKey = apiKey || env.HUGGINGFACE_API_KEY;

    if (!effectiveApiKey) {
      return new Response(
        JSON.stringify({
          error: {
            message:
              "API key required. Set Authorization header with Bearer token.",
            type: "invalid_request_error",
            code: "missing_api_key",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Resoudre le modele (accepte l'id court ou le modelId complet)
    const resolvedModel = resolveModel(model || getDefaultModel().modelId);

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: effectiveApiKey,
    });

    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Mode streaming
    if (stream) {
      const streamResponse = await client.chat.completions.create({
        model: resolvedModel,
        messages: formattedMessages,
        max_tokens: max_tokens,
        temperature: temperature,
        stream: true,
      });

      const encoder = new TextEncoder();
      const responseId = generateId();
      const created = Math.floor(Date.now() / 1000);

      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || "";
              const finishReason = chunk.choices[0]?.finish_reason;

              // Format compatible OpenAI
              const sseData = {
                id: responseId,
                object: "chat.completion.chunk",
                created: created,
                model: resolvedModel,
                choices: [
                  {
                    index: 0,
                    delta: content ? { content } : {},
                    finish_reason: finishReason || null,
                  },
                ],
              };

              const data = `data: ${JSON.stringify(sseData)}\n\n`;
              controller.enqueue(encoder.encode(data));
            }

            // Signal de fin
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            const errorData = {
              error: {
                message: (error as Error).message,
                type: "api_error",
              },
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`)
            );
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    // Mode non-streaming
    const chatCompletion = await client.chat.completions.create({
      model: resolvedModel,
      messages: formattedMessages,
      max_tokens: max_tokens,
      temperature: temperature,
    });

    const content = chatCompletion.choices[0]?.message?.content || "";

    // Reponse au format OpenAI
    const response: OpenAIChatResponse = {
      id: generateId(),
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: resolvedModel,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: content.trim(),
          },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erreur API OpenAI-compatible:", error);
    return new Response(
      JSON.stringify({
        error: {
          message: (error as Error).message || "Internal server error",
          type: "api_error",
          code: "internal_error",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Support CORS pour les appels externes
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
