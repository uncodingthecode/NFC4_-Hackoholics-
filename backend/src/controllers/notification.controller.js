import { Notification } from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user._id })
      .sort({ timestamp: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user_id: req.user._id },
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user._id, is_read: false },
      { $set: { is_read: true } }
    );

    return res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createMedicationReminder = async (medication) => {
  try {
    await Notification.create({
      user_id: medication.user_id,
      type: 'med_reminder',
      message: `Time to take ${medication.medicine_name} (${medication.dosage})`
    });
  } catch (error) {
    console.error("Error creating reminder:", error);
  }
};