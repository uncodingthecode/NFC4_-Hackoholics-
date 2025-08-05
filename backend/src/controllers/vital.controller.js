import  Vital  from "../models/vital.model.js";

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