import Vital from "../models/vital.model.js";


/**
 * Start wearable simulator (sends vitals every X seconds for demo).
 */
export const startWearableSimulator = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({ error: "User ID missing" });
    }

    // Simulate vitals every 10 seconds (in-memory simulation for demo)
    const simulateInterval = setInterval(async () => {
      const randomVital = {
        bp_systolic: Math.floor(Math.random() * 30) + 100,  // 100-130
        bp_diastolic: Math.floor(Math.random() * 20) + 70,  // 70-90
        sugar: Math.floor(Math.random() * 50) + 80,         // 80-130
        weight: Math.floor(Math.random() * 10) + 60,        // 60-70 kg
        temperature: (Math.random() * 1.5 + 98).toFixed(1), // 98-99.5 °F
      };

      await Vital.create({
        user_id: userId,
        ...randomVital
      });

      console.log("🩺 Simulated vitals sent:", randomVital);
    }, 10000);  // every 10 seconds

    // Automatically stop after 1 minute
    setTimeout(() => {
      clearInterval(simulateInterval);
      console.log("⏹️ Simulator stopped after 1 minute");
    }, 60000);

    res.status(200).json({ message: "Simulator started for 1 minute" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Record vitals from an authenticated user.
 */
export const recordVital = async (req, res) => {
  try {
    const { bp_systolic, bp_diastolic, sugar, weight, temperature } = req.body;

    const vital = await Vital.create({
      user_id: req.user._id,
      bp_systolic,
      bp_diastolic,
      sugar,
      weight,
      temperature
    });

    return res.status(201).json(vital);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get vital history for a user. Optional filter: last X days.
 */
export const getVitalHistory = async (req, res) => {
  try {
    const { days } = req.query;
    let query = { user_id: req.user._id };

    if (days) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));
      query.timestamp = { $gte: date };
    }

    const vitals = await Vital.find(query).sort({ timestamp: -1 });
    return res.status(200).json(vitals);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Get average, max, min stats of vitals for a user.
 */
export const getVitalStats = async (req, res) => {
  try {
    const stats = await Vital.aggregate([
      { $match: { user_id: req.user._id } },
      {
        $group: {
          _id: null,
          avgBpSystolic: { $avg: "$bp_systolic" },
          avgBpDiastolic: { $avg: "$bp_diastolic" },
          avgSugar: { $avg: "$sugar" },
          avgWeight: { $avg: "$weight" },
          maxBpSystolic: { $max: "$bp_systolic" },
          minBpSystolic: { $min: "$bp_systolic" },
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json(stats[0] || {});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

/**
 * Simulate vitals from a wearable device (NO auth required or optional token).
 * Accepts user_id in request body.
 */
export const simulateVitals = async (req, res) => {
  try {
    const { user_id, bp_systolic, bp_diastolic, sugar, weight, temperature } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required for simulation" });
    }

    const vital = await Vital.create({
      user_id,
      bp_systolic,
      bp_diastolic,
      sugar,
      weight,
      temperature,
    });

    return res.status(201).json({ success: true, data: vital });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
