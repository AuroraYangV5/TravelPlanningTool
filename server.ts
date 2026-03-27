import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { generateItineraryDoubao, chatDoubao } from "./services/doubaoService";
import { generateItineraryQwen, chatQwen } from "./services/qwenService";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API routes
app.post("/api/generate-itinerary", async (req, res) => {
  const { prompt, modelType = "qwen", apiKey } = req.body;

  try {
    let content;
    if (modelType === "qwen") {
      content = await generateItineraryQwen(prompt, apiKey);
      console.log('/api/generate-itinerary:', content)
    } else {
      content = await generateItineraryDoubao(prompt, apiKey);
    }
    res.json({ text: content });
  } catch (error: any) {
    console.error(`${modelType} API Error:`, error);
    res.status(500).json({ error: error.message || `Failed to generate itinerary with ${modelType}.` });
  }
});

app.post("/api/chat", async (req, res) => {
  const { message, history, systemInstruction, modelType = "qwen", apiKey } = req.body;

  try {
    let content;
    if (modelType === "qwen") {
      content = await chatQwen(message, history, systemInstruction, apiKey);
    } else {
      content = await chatDoubao(message, history, systemInstruction, apiKey);
    }
    res.json({ text: content });
  } catch (error: any) {
    console.error(`${modelType} API Error:`, error);
    res.status(500).json({ error: error.message || `Failed to chat with ${modelType}.` });
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
