import dotenv from "dotenv";
dotenv.config(); // Load .env first

import connectDB from "./db/db.js";
import app from "./app.js";
import { startAllAgents } from "../ai-agents/aiAgentManager.js";

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    startAllAgents(); // ⏱ Run AI agents every 5 mins
    console.log("🤖 AI Health Agents started");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();