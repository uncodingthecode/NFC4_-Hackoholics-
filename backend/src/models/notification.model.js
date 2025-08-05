import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
  type: String,
  enum: ['med_reminder', 'appointment', 'low_stock', 'medication_added'],
  },
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  is_read: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);
