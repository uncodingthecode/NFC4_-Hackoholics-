import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export async function getGeminiResponse(userMessage) {
  const requestBody = {
    contents: [{ parts: [{ text: userMessage }] }],
  };

  const response = await axios.post(GEMINI_URL, requestBody);
  const aiText = response.data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I have no response.';
  return aiText;
}
