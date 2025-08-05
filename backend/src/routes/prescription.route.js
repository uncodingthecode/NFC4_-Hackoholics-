import express from "express";
import {
  uploadPrescription,
  processPrescription,
  createMedicationsFromPrescription,
  processPrescriptionWithGemini,
  getPrescriptions
} from "../controllers/prescription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .get(getPrescriptions)
  .post(upload.single("image"), uploadPrescription);

router.route("/:id/process")
  .post(processPrescription);

router.route("/:id/process-gemini")
  .post(processPrescriptionWithGemini);

router.route("/:id/create-medications")
  .post(createMedicationsFromPrescription);

export default router;