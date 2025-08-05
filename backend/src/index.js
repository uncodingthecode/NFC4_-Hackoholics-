import dotenv from "dotenv";
dotenv.config(); // Load .env first

import connectDB from "./db/db.js";
import app from "./app.js";
import { startAllAgents } from "../ai-agents/aiAgentManager.js";
import { startSimulator } from "./simulator/wearableSimulator.js"; // ✅ Import simulator

const PORT = process.env.PORT || 8000;

// Replace with actual user ID for demo or testing
const SIMULATOR_USER_ID = "YOUR_REAL_USER_ID_HERE";

(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");

    startAllAgents(); // ⏱ Run AI agents every 5 mins
    console.log("🤖 AI Health Agents started");

    // ✅ Start wearable data simulator - sends data every 1 minute

    console.log("⌚ Virtual wearable simulator started - sending vitals every 1 minute");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();
