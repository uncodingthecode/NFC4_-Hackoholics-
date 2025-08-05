import express from "express";
import {
  processPrescriptionWithGemini,
  chatWithGemini,
  healthChatbot
} from "../controllers/gemini.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

/**
 * @route POST /api/gemini/process-prescription/:id
 * @desc Process prescription OCR text with Gemini AI to extract medications
 */
router.post("/process-prescription/:id", processPrescriptionWithGemini);

/**
 * @route POST /api/gemini/chat
 * @desc General chatbot conversation with Gemini
 */
router.post("/chat", chatWithGemini);

/**
 * @route POST /api/gemini/health-chat
 * @desc Health-specific chatbot with user context
 */
router.post("/health-chat", healthChatbot);

export default router; 