import express from "express";
import { runAllAgentsOnce } from "../../ai-agents/aiAgentManager.js";

const router = express.Router();

router.post("/run-now", async (req, res) => {
  try {
    await runAllAgentsOnce();
    res.json({ message: "Agents executed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Agent execution failed" });
  }
});

export default router;