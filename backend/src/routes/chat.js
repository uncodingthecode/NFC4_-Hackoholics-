import express from 'express';
import { getOpenAIResponse } from '../services/openaiService.js';  // Update path as needed

const router = express.Router();

router.post('/', async (req, res) => {
  const { message } = req.body;

  try {
    const aiReply = await getOpenAIResponse(message);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'AI response failed' });
  }
});

export const chatRoute = router;
