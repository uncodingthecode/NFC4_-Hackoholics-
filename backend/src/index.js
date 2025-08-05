import dotenv from "dotenv";
dotenv.config(); // Load environment variables early

import connectDB from "./db/db.js";
import app from "./app.js";
import { startAllAgents } from "../ai-agents/aiAgentManager.js";
import agentRoutes from "./routes/agent.routes.js"; // Manual agent trigger

const PORT = process.env.PORT || 8000;

(async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    console.log("✅ MongoDB connected");

    // 2. Register routes
    app.use("/api/agent", agentRoutes); // Manually run agents via API

    // 3. Start AI Health Agents automatically every 5 min
    startAllAgents();
    console.log("🤖 AI Health Agents started");

    // 4. Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1); // Exit if any part of startup fails
  }
})();
