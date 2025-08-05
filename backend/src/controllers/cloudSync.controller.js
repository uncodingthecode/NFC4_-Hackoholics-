import cloudSyncService from '../services/cloudSyncService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const initializeCloudSync = asyncHandler(async (req, res) => {
  const { cloudProvider } = req.body;
  const userId = req.user._id;

  const result = await cloudSyncService.initializeCloudSync(userId, cloudProvider);

  return res.status(200).json(
    new ApiResponse(200, result, "Cloud sync initialized successfully")
  );
});

const connectGoogleDrive = asyncHandler(async (req, res) => {
  const { authCode } = req.body;
  const userId = req.user._id;

  if (!authCode) {
    throw new ApiError(400, "Authorization code is required");
  }

  const result = await cloudSyncService.connectGoogleDrive(userId, authCode);

  return res.status(200).json(
    new ApiResponse(200, result, "Google Drive connected successfully")
  );
});

const syncToCloud = asyncHandler(async (req, res) => {
  const { dataTypes } = req.body;
  const userId = req.user._id;

  const result = await cloudSyncService.syncToCloud(userId, dataTypes);

  return res.status(200).json(
    new ApiResponse(200, result, "Data synced to cloud successfully")
  );
});

const syncFromCloud = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const result = await cloudSyncService.syncFromCloud(userId);

  return res.status(200).json(
    new ApiResponse(200, result, "Data synced from cloud successfully")
  );
});

const getSyncStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const status = await cloudSyncService.getSyncStatus(userId);

  return res.status(200).json(
    new ApiResponse(200, status, "Sync status retrieved successfully")
  );
});

const updateSyncSettings = asyncHandler(async (req, res) => {
  const { syncFrequency, dataTypes } = req.body;
  const userId = req.user._id;

  const settings = {};
  if (syncFrequency) settings.sync_frequency = syncFrequency;
  if (dataTypes) settings.data_types = dataTypes;

  const result = await cloudSyncService.updateSyncSettings(userId, settings);

  return res.status(200).json(
    new ApiResponse(200, result, "Sync settings updated successfully")
  );
});

const getGoogleDriveAuthUrl = asyncHandler(async (req, res) => {
  const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_DRIVE_REDIRECT_URI;
  const scope = 'https://www.googleapis.com/auth/drive.file';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline`;

  return res.status(200).json(
    new ApiResponse(200, { authUrl }, "Google Drive auth URL generated")
  );
});

const getFitbitAuthUrl = asyncHandler(async (req, res) => {
  const clientId = process.env.FITBIT_CLIENT_ID;
  const redirectUri = process.env.FITBIT_REDIRECT_URI;
  const scope = 'activity heartrate sleep weight';

  const authUrl = `https://www.fitbit.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;

  return res.status(200).json(
    new ApiResponse(200, { authUrl }, "Fitbit auth URL generated")
  );
});

export {
  initializeCloudSync,
  connectGoogleDrive,
  syncToCloud,
  syncFromCloud,
  getSyncStatus,
  updateSyncSettings,
  getGoogleDriveAuthUrl,
  getFitbitAuthUrl,
}; 