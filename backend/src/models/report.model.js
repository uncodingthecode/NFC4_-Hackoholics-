import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['health_summary', 'vital_trends', 'medication_report', 'comprehensive'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  ai_generated: {
    type: Boolean,
    default: true,
  },
  data_period: {
    start_date: Date,
    end_date: Date,
  },
  pdf_url: String,
  generated_at: {
    type: Date,
    default: Date.now,
  },
  is_public: {
    type: Boolean,
    default: false,
  },
  shared_with: [{
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    shared_at: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

export default mongoose.model("Report", reportSchema); 