import express from 'express';
import { getGeminiResponse } from '../services/geminiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;
  try {
    const aiReply = await getGeminiResponse(message);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('Gemini error:', err.message);
    res.status(500).json({ error: 'AI response failed' });
  }
});

export const chatRoute = router;
