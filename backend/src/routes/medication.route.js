import express from "express";
import {
  addMedication,
  getMedications,
  updateMedication,
  recordMedicationTaken,
  deleteMedication
} from "../controllers/medication.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .post(addMedication)
  .get(getMedications);

router.route("/:id")
  .patch(updateMedication)
  .delete(deleteMedication);

router.route("/:id/taken").post(recordMedicationTaken);

export default router;