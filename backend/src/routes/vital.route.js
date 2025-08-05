import express from "express";
import {
  recordVital,
  getVitalHistory,
  getVitalStats,
  simulateVitals
} from "../controllers/vital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { startWearableSimulator } from '../controllers/vital.controller.js';


const router = express.Router();

// --- Authenticated user routes ---
router.use(verifyJWT);

router.route("/")
  .post(recordVital)
  .get(getVitalHistory);

router.route("/stats").get(getVitalStats);

// --- Public simulator route (DO NOT use verifyJWT here) ---
router.post("/simulator", verifyJWT, startWearableSimulator);


export default router;
