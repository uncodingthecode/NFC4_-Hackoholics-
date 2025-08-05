import wearableService from '../services/wearableService.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const connectFitbit = asyncHandler(async (req, res) => {
  const { authCode } = req.body;
  const userId = req.user._id;

  if (!authCode) {
    throw new ApiError(400, "Authorization code is required");
  }

  const result = await wearableService.connectFitbit(userId, authCode);

  return res.status(200).json(
    new ApiResponse(200, result, "Fitbit connected successfully")
  );
});

const connectAppleHealth = asyncHandler(async (req, res) => {
  const { healthData } = req.body;
  const userId = req.user._id;

  if (!healthData) {
    throw new ApiError(400, "Health data is required");
  }

  const result = await wearableService.connectAppleHealth(userId, healthData);

  return res.status(200).json(
    new ApiResponse(200, result, "Apple Health connected successfully")
  );
});

const syncWearableData = asyncHandler(async (req, res) => {
  const { deviceType } = req.params;
  const userId = req.user._id;

  let result;
  switch (deviceType) {
    case 'fitbit':
      result = await wearableService.syncFitbitData(userId);
      break;
    case 'apple_health':
      // Apple Health sync would be handled differently
      result = { success: true, message: 'Apple Health sync initiated' };
      break;
    default:
      throw new ApiError(400, "Unsupported device type");
  }

  return res.status(200).json(
    new ApiResponse(200, result, "Wearable data synced successfully")
  );
});

const getUserWearables = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const wearables = await wearableService.getUserWearables(userId);

  return res.status(200).json(
    new ApiResponse(200, wearables, "Wearables retrieved successfully")
  );
});

const getSyncStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const status = await wearableService.getSyncStatus(userId);

  return res.status(200).json(
    new ApiResponse(200, status, "Sync status retrieved successfully")
  );
});

const disconnectWearable = asyncHandler(async (req, res) => {
  const { wearableId } = req.params;
  const userId = req.user._id;

  const result = await wearableService.disconnectWearable(userId, wearableId);

  return res.status(200).json(
    new ApiResponse(200, result, "Wearable disconnected successfully")
  );
});

const processWearableData = asyncHandler(async (req, res) => {
  const { wearableData } = req.body;
  const userId = req.user._id;

  if (!wearableData) {
    throw new ApiError(400, "Wearable data is required");
  }

  const insights = await wearableService.processWearableData(userId, wearableData);

  return res.status(200).json(
    new ApiResponse(200, { insights }, "Wearable data processed successfully")
  );
});

export {
  connectFitbit,
  connectAppleHealth,
  syncWearableData,
  getUserWearables,
  getSyncStatus,
  disconnectWearable,
  processWearableData,
}; 