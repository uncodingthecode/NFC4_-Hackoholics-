import express from "express";
import {
  getEmergencyInfo,
  shareEmergencyInfo,
  mailEmergencyContacts,
  shareSummary,
  testEmergency,
  generateHealthReportSummary,
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

/**
 * @route POST /api/emergency/mail-contacts
 * @desc Mail emergency information to all contacts
 */
router.post("/mail-contacts", mailEmergencyContacts);

/**
 * @route POST /api/emergency/share-summary
 * @desc Share health summary with emergency contacts
 */
router.post("/share-summary", shareSummary);

/**
 * @route GET /api/emergency/test
 * @desc Test endpoint to check if emergency routes are working
 */
router.get("/test", testEmergency);

/**
 * @route POST /api/v1/emergency/generate-summary
 * @desc Generate an AI-powered health report summary
 */
router.post("/generate-summary", generateHealthReportSummary);

export default router;
