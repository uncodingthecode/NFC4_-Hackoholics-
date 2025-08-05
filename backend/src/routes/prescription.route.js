import express from "express";
import {
  uploadPrescription,
  processPrescription,
  createMedicationsFromPrescription
} from "../controllers/prescription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.use(verifyJWT);

router.route("/")
  .post(upload.single("prescription"), uploadPrescription);

router.route("/:id/process")
  .post(processPrescription);

router.route("/:id/create-medications")
  .post(createMedicationsFromPrescription);

export default router;