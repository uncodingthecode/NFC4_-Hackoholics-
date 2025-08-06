import express from "express";
import {
  createFamily,
  getFamilyDetails,
  addFamilyMember,
  updateEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact,
  getFamilyMembers
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
  .post(addFamilyMember) // POST /api/v1/families/members
  .get(getFamilyMembers); // GET /api/v1/families/members

// Emergency contacts
router.route("/emergency-contacts")
  .put(updateEmergencyContacts) // PUT /api/v1/families/emergency-contacts
  .post(addEmergencyContact); // POST /api/v1/families/emergency-contacts

// Individual emergency contact management
router.route("/emergency-contacts/:contactId")
  .put(updateEmergencyContact) // PUT /api/v1/families/emergency-contacts/:contactId
  .delete(deleteEmergencyContact); // DELETE /api/v1/families/emergency-contacts/:contactId

export default router;