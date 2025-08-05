import db from "../src/db/mongoClient.js";
import { getCurrentHHMM } from "../src/utils/timeUtils.js";

// 🔐 Reusable
export async function getAllUsers() {
  return await db.collection("users").find({}).toArray();
}

// 🤖 Run agent logic per user
export async function runAgentForUser(user) {
  const userId = user._id;
  const vitals = await db.collection("vitals").find({ user_id: userId }).sort({ timestamp: -1 }).toArray();
  const medications = await db.collection("medication").find({ user_id: userId }).toArray();
  const now = getCurrentHHMM();

  console.log(`👤 Running AI Agent for ${user.name} (${userId})`);

  // 🩺 Check Vitals
  if (vitals.length > 0) {
    const latest = vitals[0];
    if (latest.bp_systolic > 140 || latest.bp_diastolic > 90) {
      await saveAlert(userId, "vital_alert", "High blood pressure detected", "moderate");
    }
    if (latest.sugar > 160) {
      await saveAlert(userId, "vital_alert", "High sugar level. Review your diet.", "low");
    }
  }

  // 💊 Check Meds
  for (const med of medications) {
    if (med.timing.includes(now)) {
      await saveAlert(userId, "missed_meds", `Missed dose: ${med.medicine_name}`, "high");
      await saveNotification(userId, "med_reminder", `Time to take ${med.medicine_name}`);
    }
    if (med.stock_count <= med.refill_alert_threshold) {
      await saveNotification(userId, "low_stock", `Stock running low for ${med.medicine_name}`);
    }
  }
}

// ✉️ Save alert
async function saveAlert(userId, type, message, severity) {
  await db.collection("agent_alerts").insertOne({
    user_id: userId,
    timestamp: new Date(),
    type,
    message,
    severity,
    acknowledged: false,
  });
  console.log(`[ALERT] (${userId}) ${type.toUpperCase()}: ${message}`);
}

// ✉️ Save notification
async function saveNotification(userId, type, message) {
  await db.collection("notifications").insertOne({
    user_id: userId,
    type,
    message,
    timestamp: new Date(),
    is_read: false,
  });
  console.log(`[NOTIF] (${userId}) ${type.toUpperCase()}: ${message}`);
}
