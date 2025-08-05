import express from "express";
import {
  createFamily,
  getFamilyDetails,
  addFamilyMember,
  updateEmergencyContacts,
  
} from "../controllers/family.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/members").post(addFamilyMember);
router.route("/emergency-contacts").put(updateEmergencyContacts);

export default router;