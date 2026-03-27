import dotenv from "dotenv";

dotenv.config();

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
const QWEN_ENDPOINT = QWEN_BASE_URL.endsWith("/completions")
  ? QWEN_BASE_URL
  : `${QWEN_BASE_URL.replace(/\/$/, "")}/completions`;

const QWEN_MODEL_ID = process.env.QWEN_MODEL_ID || "qwen-max";

const SYSTEM_INSTRUCTION = "你是一个专业的旅游规划师。请务必返回合法的 JSON 格式数据，包含 title, accommodation, nodes, totalBudget, routePoints 字段。";

export async function generateItineraryQwen(prompt: string, apiKey?: string, signal?: AbortSignal) {
  const finalApiKey = apiKey || QWEN_API_KEY;
  if (!finalApiKey) {
    throw new Error("Qwen API key not configured.");
  }

  const body = {
    model: QWEN_MODEL_ID,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    max_tokens: 8192,
  };

  const response = await fetch(QWEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalApiKey}`
    },
    body: JSON.stringify(body),
    signal
  });
  console.log('generateItineraryQwen:', response)

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Qwen API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

export async function chatQwen(message: string, history: any[], systemInstruction?: string, apiKey?: string, signal?: AbortSignal) {
  const finalApiKey = apiKey || QWEN_API_KEY;
  if (!finalApiKey) {
    throw new Error("Qwen API key not configured.");
  }

  const messages = [
    { role: "system", content: systemInstruction || "你是一个专业的旅游助手。" },
    ...history.map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text
    })),
    { role: "user", content: message }
  ];

  const body = {
    model: QWEN_MODEL_ID,
    messages: messages,
  };

  const response = await fetch(QWEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalApiKey}`
    },
    body: JSON.stringify(body),
    signal
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Qwen API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
}
