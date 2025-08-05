import mongoose from "mongoose";

const familySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  head_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  emergency_contacts: [
    {
      name: String,
      relation: String,
      phone: String,
      email: String,
    }
  ]
}, { timestamps: true });

export default mongoose.model("Family", familySchema);
