import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // API route for cost estimation
  app.post("/api/estimate-transport", async (req, res) => {
    try {
      const { boardingFrom, stops, currency } = req.body;
      if (!boardingFrom || !stops || stops.length === 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const prompt = `Estimate realistic average round-trip transport costs (flight/train, in USD) between the departure city (${boardingFrom}) and the destination stop(s): ${stops.join(", ")}. Return strictly structured JSON matching this schema exactly:
{ "estimates": [ { "from": string, "to": string, "mode": string, "estimated_cost_usd": number, "notes": string } ] }
Return only the JSON object, with no markdown formatting or prose.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to estimate transport costs" });
    }
  });

  // API route for Trip Intelligence
  app.post("/api/trip-intelligence", async (req, res) => {
    try {
      const { context } = req.body;
      const prompt = `You are a travel assistant. Generate 3-4 concise, genuinely useful suggestions for the following trip: ${context}.
Include an overlooked local experience matching the theme, a practical logistics tip, a rough packing note relevant to the season/destination, and a budget optimization tip.
Return strictly structured JSON matching this schema exactly:
{ "suggestions": [ { "title": string, "body": string, "type": "experience" | "logistics" | "packing" | "budget", "actionable": boolean, "actionActivity": { "title": string, "category": string, "cost": number, "duration": string } | null } ] }
Return only the JSON object, with no markdown formatting or prose.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json"
        }
      });
      
      const text = response.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Failed to generate intelligence" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
