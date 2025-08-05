import User from "../src/models/user.model.js";
import Vital from "../src/models/vital.model.js";
import Medication from "../src/models/medication.model.js";
import AgentAlert from "../src/models/agentAlert.model.js";
import Notification from "../src/models/notification.model.js";
import Family from "../src/models/family.model.js";
import { getCurrentHHMM } from "../src/utils/timeUtils.js";
import { sendEmergencyEmail } from "../src/utils/mailer.js";

// 🔐 Reusable
export async function getAllUsers() {
  return await User.find({});
}

// 🤖 Run agent logic per user
export async function runAgentForUser(user) {
  const userId = user._id;
  const vitals = await Vital.find({ user_id: userId }).sort({ timestamp: -1 });
  const medications = await Medication.find({ user_id: userId });
  const family = await Family.findById(user.family_id);
  const now = getCurrentHHMM();

  console.log(`👤 Running AI Agent for ${user.name} (${userId})`);

  // 🩺 Check Vitals
  if (vitals.length > 0) {
    const latest = vitals[0];
    if (latest.bp_systolic > 140 || latest.bp_diastolic > 90) {
      await saveAlert(userId, "vital_alert", "High blood pressure detected", "moderate");
      // Send emergency email for high BP
      if (family) {
        await sendEmergencyEmail(family, "vital_alert", "High blood pressure detected", {
          name: user.name,
          value: `${latest.bp_systolic}/${latest.bp_diastolic} mmHg`
        });
      }
    }
    if (latest.sugar > 160) {
      await saveAlert(userId, "vital_alert", "High sugar level. Review your diet.", "low");
      // Send emergency email for high sugar
      if (family) {
        await sendEmergencyEmail(family, "vital_alert", "High sugar level detected", {
          name: user.name,
          value: `${latest.sugar} mg/dL`
        });
      }
    }
  }

  // 💊 Check Meds
  for (const med of medications) {
    if (med.timing.includes(now)) {
      await saveAlert(userId, "missed_meds", `Missed dose: ${med.medicine_name}`, "high");
      await saveNotification(userId, "med_reminder", `Time to take ${med.medicine_name}`);
      
      // Send medication reminder email
      if (family) {
        await sendEmergencyEmail(family, "medication_reminder", med.medicine_name, {
          name: user.name,
          dosage: med.dosage
        });
      }
    }
    if (med.stock_count <= med.refill_alert_threshold) {
      await saveNotification(userId, "low_stock", `Stock running low for ${med.medicine_name}`);
      
      // Send low stock alert email
      if (family) {
        await sendEmergencyEmail(family, "emergency_alert", `Low medication stock: ${med.medicine_name}`, {
          name: user.name
        });
      }
    }
  }
}

// ✉ Save alert
async function saveAlert(userId, type, message, severity) {
  await AgentAlert.create({
    user_id: userId,
    timestamp: new Date(),
    type,
    message,
    severity,
    acknowledged: false,
  });
  console.log(`[ALERT] (${userId}) ${type.toUpperCase()}: ${message}`);
}

// ✉ Save notification
async function saveNotification(userId, type, message) {
  await Notification.create({
    user_id: userId,
    type,
    message,
    timestamp: new Date(),
    is_read: false,
  });
  console.log(`[NOTIF] (${userId}) ${type.toUpperCase()}: ${message}`);
}
