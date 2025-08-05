import express from "express";
import {
  createFamily,
  getFamilyDetails,
  addFamilyMember,
  updateEmergencyContacts,
  getFamilyMembers
} from "../controllers/family.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/").post(createFamily).get(getFamilyDetails);
router.route("/members").post(addFamilyMember).get(getFamilyMembers);
router.route("/emergency-contacts").put(updateEmergencyContacts);

export default router;