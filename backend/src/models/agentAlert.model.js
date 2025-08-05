import mongoose from "mongoose";

const agentAlertSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['vital_alert', 'missed_meds', 'summary'],
  },
  message: String,
  severity: {
    type: String,
    enum: ['low', 'moderate', 'high'],
  },
  acknowledged: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

export default mongoose.model("AgentAlert", agentAlertSchema);
