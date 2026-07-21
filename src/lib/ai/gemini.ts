import {
  GoogleGenerativeAI,
  type Content,
  type FunctionDeclaration,
  type GenerativeModel,
  type Part,
  type GenerateContentResult,
} from "@google/generative-ai";

export interface ChatHistoryItem {
  role: "user" | "model";
  parts: Part[];
}

export interface GeminiToolHandler {
  name: string;
  declaration: FunctionDeclaration;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface GeminiCallInput {
  systemPrompt: string;
  history: ChatHistoryItem[];
  userMessage: string;
  tools: GeminiToolHandler[];
}

export interface GeminiCallOutput {
  text: string;
  toolEvents: Array<{
    name: string;
    args: Record<string, unknown>;
    result: unknown;
  }>;
  modelUsed: string;
}

const MAX_TOOL_HOPS = 4;

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

function getModelChain(): string[] {
  const override = process.env.GEMINI_MODEL?.trim();
  if (override) return [override];
  return FALLBACK_MODELS;
}

function shouldFallback(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /404|not found|not supported|503|unavailable|overloaded/i.test(msg);
}

let cachedClient: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY nuk është konfiguruar.");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenerativeAI(apiKey);
  }
  return cachedClient;
}

interface BuildModelArgs {
  systemPrompt: string;
  declarations: FunctionDeclaration[];
}

function buildModel(modelName: string, args: BuildModelArgs): GenerativeModel {
  return getClient().getGenerativeModel({
    model: modelName,
    systemInstruction: { role: "system", parts: [{ text: args.systemPrompt }] },
    tools:
      args.declarations.length > 0
        ? [{ functionDeclarations: args.declarations }]
        : undefined,
  });
}

async function generateWithFallback(
  args: BuildModelArgs,
  conversation: Content[],
): Promise<{ result: GenerateContentResult; modelName: string }> {
  const chain = getModelChain();
  let lastErr: unknown = null;

  for (const modelName of chain) {
    try {
      const model = buildModel(modelName, args);
      const result = await model.generateContent({ contents: conversation });
      return { result, modelName };
    } catch (err) {
      lastErr = err;
      if (!shouldFallback(err)) throw err;
      console.warn(`[gemini] ${modelName} failed, trying next…`);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error("Të gjitha modelet Gemini dështuan.");
}

export async function generateChatReply(input: GeminiCallInput): Promise<GeminiCallOutput> {
  const declarations = input.tools.map((t) => t.declaration);
  const handlerByName = new Map<string, GeminiToolHandler>(
    input.tools.map((t) => [t.name, t]),
  );
  const args: BuildModelArgs = {
    systemPrompt: input.systemPrompt,
    declarations,
  };

  const conversation: Content[] = [
    ...input.history.map((h) => ({ role: h.role, parts: h.parts })),
    { role: "user", parts: [{ text: input.userMessage }] },
  ];

  const toolEvents: GeminiCallOutput["toolEvents"] = [];

  let { result, modelName } = await generateWithFallback(args, conversation);
  const model = buildModel(modelName, args);

  for (let hop = 0; hop < MAX_TOOL_HOPS; hop++) {
    const response = result.response;
    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts ?? [];

    const functionCalls = parts.flatMap((p) =>
      "functionCall" in p && p.functionCall ? [p.functionCall] : [],
    );

    if (functionCalls.length === 0) {
      const text = parts
        .map((p) => ("text" in p && typeof p.text === "string" ? p.text : ""))
        .filter(Boolean)
        .join("\n")
        .trim();
      return { text, toolEvents, modelUsed: modelName };
    }

    conversation.push({ role: "model", parts: parts as Part[] });

    const toolResponseParts: Part[] = [];
    for (const call of functionCalls) {
      const handler = handlerByName.get(call.name);
      const callArgs = (call.args ?? {}) as Record<string, unknown>;
      let toolResult: unknown;
      if (!handler) {
        toolResult = { error: `Mjet i panjohur: ${call.name}` };
      } else {
        try {
          toolResult = await handler.execute(callArgs);
        } catch (err) {
          toolResult = {
            error: err instanceof Error ? err.message : "Gabim gjatë ekzekutimit të mjetit",
          };
        }
      }
      toolEvents.push({ name: call.name, args: callArgs, result: toolResult });
      toolResponseParts.push({
        functionResponse: {
          name: call.name,
          response: { result: toolResult },
        },
      });
    }

    conversation.push({ role: "user", parts: toolResponseParts });
    result = await model.generateContent({ contents: conversation });
  }

  return {
    text: "Na vjen keq, nuk mund ta përfundoj kërkesën. Provoni të na kontaktoni përmes WhatsApp ose faqes së kontaktit.",
    toolEvents,
    modelUsed: modelName,
  };
}

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}
