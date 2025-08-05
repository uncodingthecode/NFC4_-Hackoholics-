import express from "express";
import {
  getProfile,
  createOrUpdateProfile,
  addFamilyDoctor
} from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

// Profile routes
router.route("/")
  .get(getProfile)           // GET /api/v1/profile
  .post(createOrUpdateProfile); // POST /api/v1/profile

// Add family doctor
router.route("/family-doctor")
  .post(addFamilyDoctor);    // POST /api/v1/profile/family-doctor

export default router; 