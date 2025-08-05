import { Router } from "express";
import {
  generateReport,
  getReports,
  getReportById,
  shareReport,
  deleteReport,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyJWT);

// Report generation and management routes
router.post("/generate", generateReport);
router.get("/", getReports);
router.get("/:reportId", getReportById);
router.post("/share", shareReport);
router.delete("/:reportId", deleteReport);

export default router; 