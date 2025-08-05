import express from "express";
import {
  createFamily,
  getFamilyDetails,
  addFamilyMember,
  updateEmergencyContacts
} from "../controllers/family.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

// Family CRUD operations
router.route("/")
  .post(createFamily)    // POST /api/v1/families
  .get(getFamilyDetails); // GET /api/v1/families

// Family member management
router.route("/members")
  .post(addFamilyMember); // POST /api/v1/families/members

// Emergency contacts
router.route("/emergency-contacts")
  .put(updateEmergencyContacts); // PUT /api/v1/families/emergency-contacts

export default router;