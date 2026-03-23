import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize OpenAI client for Doubao (Ark) - Coding Plan
const client = new OpenAI({
  apiKey: process.env.DOUBAO_API_KEY || "dummy",
  baseURL: "https://ark.cn-beijing.volces.com/api/coding/v3",
});

app.use(express.json());

// API routes
app.post("/api/generate-itinerary", async (req, res) => {
  const { prompt } = req.body;

  if (!process.env.DOUBAO_API_KEY || !process.env.DOUBAO_MODEL_ID) {
    return res.status(500).json({ error: "Doubao API key or Model ID not configured. Please set DOUBAO_API_KEY and DOUBAO_MODEL_ID in the secrets panel." });
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.DOUBAO_MODEL_ID,
      messages: [
        { role: "system", content: "你是一个专业的旅游规划师。请根据用户要求生成详细的旅游攻略。请务必返回合法的 JSON 格式数据。" },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    res.json({ text: content });
  } catch (error: any) {
    console.error("Doubao API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate itinerary with Doubao." });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, history, systemInstruction } = req.body;

  if (!process.env.DOUBAO_API_KEY || !process.env.DOUBAO_MODEL_ID) {
    return res.status(500).json({ error: "Doubao API key or Model ID not configured. Please set DOUBAO_API_KEY and DOUBAO_MODEL_ID in the secrets panel." });
  }

  try {
    const messages = [
      { role: "system", content: systemInstruction || "你是一个专业的旅游助手。" },
      ...history.map((h: any) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.text
      })),
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: process.env.DOUBAO_MODEL_ID,
      messages: messages as any,
    });

    const content = completion.choices[0].message.content;
    res.json({ text: content });
  } catch (error: any) {
    console.error("Doubao API Error:", error);
    res.status(500).json({ error: error.message || "Failed to chat with Doubao." });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
