import express from "express";
import {
  getEmergencyInfo,
  shareEmergencyInfo
} from "../controllers/emergency.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .get(getEmergencyInfo);

router.route("/share/:contactId")
  .post(shareEmergencyInfo);

export default router;