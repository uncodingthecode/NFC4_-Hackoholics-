// import mongoose from "mongoose";

// const agentSchema = new mongoose.Schema({
//   user_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//     unique: true
//   },
//   monitoring_rules: {
//     vitals: {
//       blood_pressure: { min: Number, max: Number },
//       blood_sugar: { min: Number, max: Number },
//       temperature: { min: Number, max: Number }
//     },
//     medication_adherence: {
//       strict: Boolean,
//       allowed_miss_minutes: Number
//     }
//   },
//   alert_preferences: {
//     email: Boolean,
//     push: Boolean,
//     sms: Boolean
//   },
//   last_analysis: Date
// }, { timestamps: true });

// export default mongoose.model("Agent", agentSchema);