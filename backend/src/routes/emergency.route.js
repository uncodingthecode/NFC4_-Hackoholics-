import express from "express";
import {
  getEmergencyInfo,
  shareEmergencyInfo,
} from "../controllers/emergency.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply JWT verification to all emergency routes
router.use(verifyJWT);

/**
 * @route GET /api/emergency/
 * @desc Get emergency medical info of the logged-in user
 */
router.get("/", getEmergencyInfo);

/**
 * @route POST /api/emergency/share/:contactId
 * @desc Share emergency info via email with specified contact
 */
router.post("/share/:contactId", shareEmergencyInfo);

export default router;
