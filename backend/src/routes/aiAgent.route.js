import express from "express";
import {
  getAlerts,
  acknowledgeAlert,
  getHealthSummary
} from "../controllers/aiAgent.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/alerts")
  .get(getAlerts);

router.route("/alerts/:id/acknowledge")
  .patch(acknowledgeAlert);

router.route("/health-summary")
  .get(getHealthSummary);

export default router;