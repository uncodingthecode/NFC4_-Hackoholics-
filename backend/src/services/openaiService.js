import axios from 'axios';

export async function getOpenAIResponse(userMessage) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-002:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [{ parts: [{ text: userMessage.slice(0, 100) }] }],  // Limit input tokens by slicing
    generationConfig: {
      maxOutputTokens: 50,  // Output limited to 50 tokens (minimal)
      temperature: 0.7,     // Lower = more predictable
      topP: 0.8,            // Limits randomness
      topK: 20              // Reduce token search space
    }
  };

  try {
    const response = await axios.post(GEMINI_URL, requestBody);
    const aiText = response.data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I have no response.';
    return aiText;
  } catch (err) {
    console.error('Gemini API call failed:', err.response?.data || err.message);
    throw err;
  }
}
