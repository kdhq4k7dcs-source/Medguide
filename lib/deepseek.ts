const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

interface CallDeepSeekOptions {
  systemPrompt: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
  useJsonFormat?: boolean;
}

export async function callDeepSeek(options: CallDeepSeekOptions): Promise<string> {
  const {
    systemPrompt,
    userMessage,
    temperature = 0.3,
    maxTokens = 2000,
    useJsonFormat = true,
  } = options;

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === "sk-your-deepseek-api-key-here") {
    throw new Error("DEEPSEEK_API_KEY is not configured. Please set it in .env.local");
  }

  const body: Record<string, unknown> = {
    model: DEEPSEEK_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature,
    max_tokens: maxTokens,
  };

  if (useJsonFormat) {
    body.response_format = { type: "json_object" };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= 2; attempt++) {
    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      lastError = error as Error;
      if (attempt < 2) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw lastError ?? new Error("DeepSeek API call failed");
}
