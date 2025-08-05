import { createWorker } from "tesseract.js";
import fs from "fs";
import path from "path";
import gtts from "gtts"; // ✅ correct import
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const processOCR = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imagePath = req.file.path;
  const worker = await createWorker("eng");

  try {
    const {
      data: { text },
    } = await worker.recognize(imagePath);
    await worker.terminate();

    fs.unlinkSync(imagePath); // cleanup

    if (!text.trim()) {
      return res.status(200).json({ text: "", audioUrl: null });
    }

    const audioDir = path.join(__dirname, "..", "tts_output");
    fs.mkdirSync(audioDir, { recursive: true });

    const audioFile = `${Date.now()}.mp3`;
    const audioPath = path.join(audioDir, audioFile);

    const tts = new gtts(text, "en"); // ✅ correct usage
    tts.save(audioPath, (err) => {
      if (err) {
        return res.status(500).json({ error: "TTS failed", details: err.message });
      }

      const audioUrl = `/audio/${audioFile}`;
      return res.status(200).json({ text, audioUrl });
    });
  } catch (error) {
    return res.status(500).json({ error: "OCR failed", details: error.message });
  }
};
