import { getAllUsers, runAgentForUser } from "./agents.js";

export function startAllAgents() {
  setInterval(() => {
    runAllAgentsOnce();
  }, 5 * 60 * 1000); // 5 min
}

export async function runAllAgentsOnce() {
  console.log("🔁 Running AI agents for all users...");
  const users = await getAllUsers();

  for (const user of users) {
    await runAgentForUser(user);
  }
}