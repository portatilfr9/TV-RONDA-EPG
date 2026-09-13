import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for EPG data
  const epgCache = new Map<string, any>();

  app.post("/api/epg", async (req, res) => {
    try {
      const { date, channels } = req.body;
      
      if (epgCache.has(date)) {
        return res.json(epgCache.get(date));
      }
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Eres un experto en televisión española. Genera la programación EPG realista para el día ${date} para los siguientes canales: ${channels.map((c: any) => c.name).join(', ')}. 
        
        IMPORTANTE: 
        1. Para canales de deportes como "M+ LaLiga", incluye los partidos específicos (ej. "Levante - Barcelona").
        2. Devuelve un array de objetos con este esquema: { channelId, title, description, startTime (ISO), endTime (ISO), category }.
        3. Asegúrate de cubrir las 24 horas del día.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                channelId: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                category: { type: Type.STRING },
              },
              required: ["channelId", "title", "description", "startTime", "endTime", "category"]
            }
          }
        }
      });

      const programs = JSON.parse(response.text || "[]");
      epgCache.set(date, programs);
      res.json(programs);
    } catch (error: any) {
      if (error?.status === 'RESOURCE_EXHAUSTED' || error?.message?.includes('429')) {
        console.warn(`[Gemini API] Rate limit exceeded (429). Falling back to client-side generation.`);
      } else {
        console.error("Gemini EPG Error:", error?.message || error);
      }
      res.status(500).json({ error: "Failed to generate EPG data" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
