import  AgentAlert  from "../models/agentAlert.model.js";
import  Vital  from "../models/vital.model.js";
import  Medication  from "../models/medication.model.js";

export const getAlerts = async (req, res) => {
  try {
    const alerts = await AgentAlert.find({ user_id: req.user._id })
      .sort({ timestamp: -1 });

    return res.status(200).json(alerts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await AgentAlert.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      { acknowledged: true },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ error: "Alert not found" });
    }

    return res.status(200).json(alert);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getHealthSummary = async (req, res) => {
  try {
    const [vitals, medications, recentAlerts] = await Promise.all([
      Vital.find({ user_id: req.user._id }).sort({ timestamp: -1 }).limit(5),
      Medication.find({ user_id: req.user._id }),
      AgentAlert.find({ user_id: req.user._id, acknowledged: false }).limit(5)
    ]);

    const summary = {
      latestVitals: vitals,
      medicationCount: medications.length,
      activeAlerts: recentAlerts,
      pendingMeds: medications.filter(m => m.stock_count <= m.refill_alert_threshold)
    };

    return res.status(200).json(summary);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// This would be called periodically by a scheduled job
export const analyzeHealthData = async (userId) => {
  try {
    // Get recent vitals
    const vitals = await Vital.find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(10);

    if (vitals.length === 0) return;

    // Analyze trends (simplified example)
    const lastVital = vitals[0];
    const avgBp = vitals.reduce((sum, v) => sum + (v.bp_systolic + v.bp_diastolic) / 2, 0) / vitals.length;

    // Check for abnormal readings
    if (lastVital.bp_systolic > 140 || lastVital.bp_diastolic > 90) {
      await AgentAlert.create({
        user_id: userId,
        type: 'vital_alert',
        message: `High blood pressure detected (${lastVital.bp_systolic}/${lastVital.bp_diastolic})`,
        severity: 'high'
      });
    }

    // Check for medication adherence
    const medications = await Medication.find({ user_id: userId });
    for (const med of medications) {
      // Check if stock is low
      if (med.stock_count <= med.refill_alert_threshold) {
        await AgentAlert.create({
          user_id: userId,
          type: 'missed_meds',
          message: `${med.medicine_name} is running low (${med.stock_count} left)`,
          severity: 'moderate'
        });
      }
    }

  } catch (error) {
    console.error("Health analysis error:", error);
  }
};