import express from "express";
import {
  recordVital,
  getVitalHistory,
  getVitalStats
} from "../controllers/vital.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .post(recordVital)
  .get(getVitalHistory);

router.route("/stats").get(getVitalStats);

export default router;