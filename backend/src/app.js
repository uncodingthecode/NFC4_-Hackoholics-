import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Routes
import ocrRoutes from "./routes/ocr.routes.js";
import agentRoutes from "./routes/agent.routes.js"; // ✅ added here

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// 🔐 Middleware
app.use(cors());
app.use(express.json());

// 📁 Static Files (e.g. audio)
app.use("/audio", express.static(path.join(__dirname, "tts_output")));

// 🔀 API Routes
app.use("/api/ocr", ocrRoutes);
app.use("/api/agent", agentRoutes); // ✅ integrated here

export default app;
