import express from "express";
import { startAllAgents } from "./aiAgentManager.js";

const app = express();
const PORT = 5001;

app.get("/", (req, res) => {
  res.send("AI Health Agents running for all family members");
});

app.listen(PORT, () => {
  console.log(`AI Agents listening on port ${PORT}`);
  startAllAgents(); // Triggers all user agents
});
