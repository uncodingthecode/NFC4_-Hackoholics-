import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  upload_time: {
    type: Date,
    default: Date.now,
  },
  image_url: String,
  ocr_text: String,
  extracted_medications: [
    {
      name: String,
      dosage: String,
      frequency: String,
      linked_medication_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medication"
      }
    }
  ]
}, { timestamps: true });

export default mongoose.model("Prescription", prescriptionSchema);
