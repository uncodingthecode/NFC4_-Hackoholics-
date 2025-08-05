import mongoose from "mongoose";

const vitalSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  bp_systolic: Number,
  bp_diastolic: Number,
  sugar: Number,
  weight: Number,
  temperature: Number,
}, { timestamps: true });

export default mongoose.model("Vital", vitalSchema);
