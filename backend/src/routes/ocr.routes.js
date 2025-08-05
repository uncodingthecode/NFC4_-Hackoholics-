// routes/ocr.routes.js
import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { processOCR } from "../controllers/ocr.controllers.js";

const router = express.Router();

router.post("/ocr", upload.single("image"), processOCR);

export default router;
