// app.js
import express from "express";
import cors from "cors";
import ocrRoutes from "./routes/ocr.routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve audio files
app.use("/audio", express.static(path.join(__dirname, "tts_output")));

// OCR Routes
app.use("/api", ocrRoutes);

export default app;
