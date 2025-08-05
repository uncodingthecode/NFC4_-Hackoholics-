import { Router } from "express";
import {
  connectFitbit,
  connectAppleHealth,
  syncWearableData,
  getUserWearables,
  getSyncStatus,
  disconnectWearable,
  processWearableData,
} from "../controllers/wearable.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Wearable device integration routes
router.post("/connect/fitbit", connectFitbit);
router.post("/connect/apple-health", connectAppleHealth);
router.post("/sync/:deviceType", syncWearableData);
router.get("/", getUserWearables);
router.get("/sync-status", getSyncStatus);
router.delete("/:wearableId", disconnectWearable);
router.post("/process-data", processWearableData);

export default router; 