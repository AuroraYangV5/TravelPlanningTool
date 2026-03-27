import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY || "dummy",
  baseURL: process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
});

const SYSTEM_INSTRUCTION = `
你是一个专业的旅游规划师。请根据用户要求生成详细的旅游攻略。
特别要求：
1. 如果目的是“特种兵旅行”，请安排极高密度的行程，每天打卡更多的景点（至少5-6个时间点），并优化路线。
2. 必须考虑景点间的地理距离，将地理位置接近的景区安排在同一天或相邻时间段，以减少交通时间，最大化游玩效率。
3. 路线必须逻辑连贯，不走回头路。
4. 请务必保持描述极度简洁（每个描述不超过20字），以节省空间。
5. 餐饮信息仅在有特色推荐时提供，否则可留空。

请返回JSON格式的数据，包含以下字段：
- title: 攻略标题
- accommodation: { name: 酒店名称, area: 所在区域, price: 大概价格 }
- nodes: 数组，每个对象包含 { day: 天数, time: 时间点, activity: 活动名称, location: 地点, transport: 交通工具, dining: { restaurant: 餐厅名, dishes: [推荐菜1, 推荐菜2] }, cost: 预估开销(数字), description: 极简描述(20字以内) }
- totalBudget: 总预估开销
- routePoints: 数组，包含 { lat: 纬度(数字), lng: 经度(数字), label: 地点 }。

注意：请务必确保返回完整的 JSON 结构。如果天数较多，请通过压缩描述长度来确保不被截断。
请务必返回合法的 JSON 格式数据。
`;

export async function generateItineraryDoubao(prompt: string, apiKey?: string, signal?: AbortSignal) {
  const modelId = process.env.DOUBAO_MODEL_ID;
  const finalApiKey = apiKey || process.env.DOUBAO_API_KEY;

  if (!finalApiKey || !modelId) {
    throw new Error("Doubao API key or Model ID not configured.");
  }

  // Create a temporary client if a custom API key is provided
  const requestClient = apiKey ? new OpenAI({
    apiKey: finalApiKey,
    baseURL: process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
  }) : client;

  const completion = await requestClient.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: SYSTEM_INSTRUCTION },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
    max_tokens: 8192,
  }, { signal });

  return completion.choices[0].message.content;
}

export async function chatDoubao(message: string, history: any[], systemInstruction?: string, apiKey?: string, signal?: AbortSignal) {
  const modelId = process.env.DOUBAO_MODEL_ID;
  const finalApiKey = apiKey || process.env.DOUBAO_API_KEY;

  if (!finalApiKey || !modelId) {
    throw new Error("Doubao API key or Model ID not configured.");
  }

  // Create a temporary client if a custom API key is provided
  const requestClient = apiKey ? new OpenAI({
    apiKey: finalApiKey,
    baseURL: process.env.DOUBAO_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
  }) : client;

  const messages = [
    { role: "system", content: systemInstruction || "你是一个专业的旅游助手。" },
    ...history.map((h: any) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.text
    })),
    { role: "user", content: message }
  ];

  const completion = await requestClient.chat.completions.create({
    model: modelId,
    messages: messages as any,
  }, { signal });

  return completion.choices[0].message.content;
}
