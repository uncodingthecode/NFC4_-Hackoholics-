import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  medicine_name: String,
  dosage: String,
  frequency: String,
  timing: [String],
  start_date: Date,
  end_date: Date,
  stock_count: Number,
  refill_alert_threshold: Number,
  prescription_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prescription"
  }
}, { timestamps: true });

export default mongoose.model("Medication", medicationSchema);
