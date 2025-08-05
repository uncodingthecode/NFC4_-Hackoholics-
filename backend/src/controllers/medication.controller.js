import { Medication } from "../models/medication.model.js";
import { Notification } from "../models/notification.model.js";

export const addMedication = async (req, res) => {
  try {
    const { medicine_name, dosage, frequency, timing, start_date, end_date, stock_count, refill_alert_threshold } = req.body;

    if (!medicine_name || !dosage || !frequency) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    const medication = await Medication.create({
      user_id: req.user._id,
      medicine_name,
      dosage,
      frequency,
      timing,
      start_date,
      end_date,
      stock_count,
      refill_alert_threshold
    });

    // Create initial notification
    await Notification.create({
      user_id: req.user._id,
      type: 'medication_added',
      message: `${medicine_name} was added to your medications`,
      metadata: {
        medication_id: medication._id,
        dosage,
        frequency
      }
    });

    return res.status(201).json(medication);
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
    });
  }
};

export const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ user_id: req.user._id });
    return res.status(200).json(medications);
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      
    });
  }
};

export const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const medication = await Medication.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      updateData,
      { new: true }
    );

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }

    // Create update notification
    await Notification.create({
      user_id: req.user._id,
      type: 'medication_updated',
      message: `${medication.medicine_name} details were updated`,
      metadata: {
        medication_id: medication._id,
        changes: Object.keys(updateData)
      }
    });

    return res.status(200).json(medication);
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      
    });
  }
};

export const recordMedicationTaken = async (req, res) => {
  try {
    const { id } = req.params;
    const { taken } = req.body;

    const medication = await Medication.findOne({ _id: id, user_id: req.user._id });
    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }

    if (taken && medication.stock_count > 0) {
      medication.stock_count -= 1;
      await medication.save();

      // Create taken notification
      await Notification.create({
        user_id: req.user._id,
        type: 'medication_taken',
        message: `You took ${medication.medicine_name}`,
        metadata: {
          medication_id: medication._id,
          remaining_stock: medication.stock_count
        }
      });

      // Check if stock is low
      if (medication.stock_count <= medication.refill_alert_threshold) {
        await Notification.create({
          user_id: req.user._id,
          type: 'low_stock',
          message: `${medication.medicine_name} is running low (${medication.stock_count} left)`,
          metadata: {
            medication_id: medication._id,
            current_stock: medication.stock_count,
            threshold: medication.refill_alert_threshold
          },
          priority: 'high'
        });
      }
    }

    return res.status(200).json(medication);
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      
    });
  }
};

export const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;

    const medication = await Medication.findOneAndDelete({ 
      _id: id, 
      user_id: req.user._id 
    });

    if (!medication) {
      return res.status(404).json({ error: "Medication not found" });
    }

    // Create deletion notification
    await Notification.create({
      user_id: req.user._id,
      type: 'medication_removed',
      message: `${medication.medicine_name} was removed from your medications`,
      metadata: {
        medication_name: medication.medicine_name,
        deleted_at: new Date()
      }
    });

    return res.status(200).json({ 
      success: true,
      message: "Medication deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
    });
  }
};