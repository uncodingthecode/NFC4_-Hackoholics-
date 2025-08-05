import mongoose from "mongoose";

const wearableSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  device_type: {
    type: String,
    enum: ['fitbit', 'apple_health', 'garmin', 'samsung_health', 'google_fit'],
    required: true,
  },
  device_name: {
    type: String,
    required: true,
  },
  access_token: {
    type: String,
    required: true,
  },
  refresh_token: String,
  token_expires_at: Date,
  is_active: {
    type: Boolean,
    default: true,
  },
  last_sync: {
    type: Date,
    default: Date.now,
  },
  sync_frequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily',
  },
  permissions: [{
    type: String,
    enum: ['steps', 'heart_rate', 'sleep', 'calories', 'weight', 'blood_pressure'],
  }],
}, { timestamps: true });

export default mongoose.model("Wearable", wearableSchema); 