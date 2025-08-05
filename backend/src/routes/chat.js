import express from 'express';
import { healthChatbot } from '../utils/geminiService.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required and must be a string' });
  }

  try {
    // Get user context from the request
    const userContext = {
      name: req.user.name,
      age: req.user.age || 'Not provided',
      bloodGroup: req.user.blood_group || 'Not provided',
      allergies: req.user.allergies || [],
      conditions: req.user.existing_conditions || [],
      medications: req.user.medications || []
    };

    const aiReply = await healthChatbot(message, userContext);
    res.json({ reply: aiReply });
  } catch (err) {
    console.error('Gemini chat error:', err.message);
    res.status(500).json({ error: 'AI response failed' });
  }
});

export const chatRoute = router;
