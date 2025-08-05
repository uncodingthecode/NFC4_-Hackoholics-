import { Router } from "express";
import {
  initializeCloudSync,
  connectGoogleDrive,
  syncToCloud,
  syncFromCloud,
  getSyncStatus,
  updateSyncSettings,
  getGoogleDriveAuthUrl,
  getFitbitAuthUrl,
} from "../controllers/cloudSync.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Cloud sync routes
router.post("/initialize", initializeCloudSync);
router.post("/connect/google-drive", connectGoogleDrive);
router.post("/sync-to-cloud", syncToCloud);
router.post("/sync-from-cloud", syncFromCloud);
router.get("/status", getSyncStatus);
router.put("/settings", updateSyncSettings);
router.get("/auth/google-drive", getGoogleDriveAuthUrl);
router.get("/auth/fitbit", getFitbitAuthUrl);

export default router; 