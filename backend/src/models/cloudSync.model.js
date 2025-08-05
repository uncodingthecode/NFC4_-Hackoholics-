import mongoose from "mongoose";

const cloudSyncSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sync_type: {
    type: String,
    enum: ['manual', 'automatic', 'scheduled'],
    default: 'automatic',
  },
  last_sync: {
    type: Date,
    default: Date.now,
  },
  sync_status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending',
  },
  data_types: [{
    type: String,
    enum: ['vitals', 'medications', 'prescriptions', 'reports', 'profile'],
  }],
  encryption_key: {
    type: String,
    required: true,
  },
  cloud_provider: {
    type: String,
    enum: ['google_drive', 'dropbox', 'onedrive', 'aws_s3'],
    default: 'google_drive',
  },
  storage_used: {
    type: Number,
    default: 0,
  },
  storage_limit: {
    type: Number,
    default: 1024 * 1024 * 1024, // 1GB default
  },
  sync_frequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily',
  },
  next_sync: Date,
  error_log: [{
    error: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
}, { timestamps: true });

export default mongoose.model("CloudSync", cloudSyncSchema); 