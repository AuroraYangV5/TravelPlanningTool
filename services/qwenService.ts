import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_APP_ID = process.env.QWEN_APP_ID;

const SYSTEM_INSTRUCTION = "你是一个专业的旅游规划师。请务必返回合法的 JSON 格式数据，包含 title, accommodation, nodes, totalBudget, cities 字段。其中 cities 包含 cityName, routePoints (lat, lng, label)。";

export async function generateItineraryQwen(prompt: string, apiKey?: string, signal?: AbortSignal) {
  const finalApiKey = apiKey || QWEN_API_KEY;
  if (!finalApiKey) {
    throw new Error("Qwen API key not configured.");
  }
  if (!QWEN_APP_ID) {
    throw new Error("Qwen App ID not configured.");
  }

  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${QWEN_APP_ID}/completion`;
  
  const data = {
    input: {
      prompt: `${SYSTEM_INSTRUCTION}\n\n用户需求：${prompt}`
    },
    parameters: {},
    debug: {}
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json'
      },
      signal
    });

    if (response.status === 200) {
      return response.data.output.text;
    } else {
      throw new Error(`Qwen API error: status=${response.status}, message=${response.data.message}`);
    }
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw error;
    }
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Error calling Qwen DashScope: ${errorMessage}`);
  }
}

export async function chatQwen(message: string, history: any[], systemInstruction?: string, apiKey?: string, signal?: AbortSignal) {
  const finalApiKey = apiKey || QWEN_API_KEY;
  if (!finalApiKey) {
    throw new Error("Qwen API key not configured.");
  }
  if (!QWEN_APP_ID) {
    throw new Error("Qwen App ID not configured.");
  }

  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${QWEN_APP_ID}/completion`;

  // DashScope App API doesn't support chat history in the same way as Chat Completions.
  // We'll prepend the history to the prompt.
  const historyText = history.map((h: any) => `${h.role === "user" ? "用户" : "助手"}: ${h.text}`).join("\n");
  const fullPrompt = `${systemInstruction || "你是一个专业的旅游助手。"}\n\n${historyText}\n用户: ${message}`;

  const data = {
    input: {
      prompt: fullPrompt
    },
    parameters: {},
    debug: {}
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${finalApiKey}`,
        'Content-Type': 'application/json'
      },
      signal
    });

    if (response.status === 200) {
      return response.data.output.text;
    } else {
      throw new Error(`Qwen API error: status=${response.status}, message=${response.data.message}`);
    }
  } catch (error: any) {
    if (axios.isCancel(error)) {
      throw error;
    }
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Error calling Qwen DashScope: ${errorMessage}`);
  }
}
