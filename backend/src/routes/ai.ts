
import { Router } from 'express';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { requireAuth } from '../auth.js';

const router = Router();
router.use(requireAuth);

const ai = env.geminiApiKey ? new GoogleGenAI({ apiKey: env.geminiApiKey }) : null;

router.post('/estimate-transport', async (req, res) => {
  const parsed = z.object({
    boardingFrom: z.string().trim().min(2).max(200),
    stops: z.array(z.string().trim().min(1).max(100)).min(1).max(30),
    currency: z.enum(['USD','INR']).optional(),
  }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid transport estimation request' });
  if (!ai) return res.status(503).json({ error: 'AI estimation is not configured. Set GEMINI_API_KEY.' });

  try {
    const { boardingFrom, stops } = parsed.data;
    const prompt = `Estimate realistic average round-trip transport costs (flight/train, in USD) between the departure city (${boardingFrom}) and destination stop(s): ${stops.join(', ')}. Return strictly JSON:
{"estimates":[{"from":string,"to":string,"mode":string,"estimated_cost_usd":number,"notes":string}]}
Return only JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const data = JSON.parse(response.text || '{"estimates":[]}');
    res.json(data);
  } catch (error) {
    console.error('Transport estimate error:', error);
    res.status(502).json({ error: 'Failed to estimate transport costs' });
  }
});

router.post('/trip-intelligence', async (req, res) => {
  const parsed = z.object({ context: z.string().trim().min(10).max(4000) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid intelligence request' });
  if (!ai) return res.status(503).json({ error: 'AI intelligence is not configured. Set GEMINI_API_KEY.' });

  try {
    const prompt = `You are a travel assistant. Generate 3-4 concise useful suggestions for this trip: ${parsed.data.context}.
Include an overlooked local experience, a practical logistics tip, a rough packing note, and a budget optimization tip.
Return JSON exactly:
{"suggestions":[{"title":string,"body":string,"type":"experience"|"logistics"|"packing"|"budget","actionable":boolean,"actionActivity":{"title":string,"category":string,"cost":number,"duration":string}|null}]}
Return only JSON.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    res.json(JSON.parse(response.text || '{"suggestions":[]}'));
  } catch (error) {
    console.error('Trip intelligence error:', error);
    res.status(502).json({ error: 'Failed to generate trip intelligence' });
  }
});

export default router;
