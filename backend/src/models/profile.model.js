import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  DOB: Date,
  height: Number,
  weight: Number,
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  blood_group: String,
  family_doctor_email: [String],
  allergies: [String],
  existing_conditions: [String],
  medications: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medication",
    }
  ]
}, { timestamps: true });

export default mongoose.model("Profile", profileSchema);
