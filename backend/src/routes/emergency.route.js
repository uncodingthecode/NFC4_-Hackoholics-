import express from "express";
import {
  getEmergencyInfo,
  shareEmergencyInfo,
  testEmailService
} from "../controllers/emergency.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .get(getEmergencyInfo);

router.route("/share/:contactId")
  .post(shareEmergencyInfo);

router.route("/test-email")
  .post(testEmailService);

export default router;