import  Prescription  from "../models/prescription.model.js";
import  Medication  from "../models/medication.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { extractMedicationsFromPrescription } from "../utils/geminiService.js";
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import path from 'path';
import gtts from 'gtts';

export const uploadPrescription = async (req, res) => {
  try {
    console.log("Upload prescription called");
    console.log("Request file:", req.file);
    console.log("Request user:", req.user);

    if (!req.file) {
      console.log("No file provided");
      return res.status(400).json({ error: "Prescription image is required" });
    }

    if (!req.user || !req.user._id) {
      console.log("No user found in request");
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Step 1: Upload to Cloudinary for storage
    console.log("Uploading to Cloudinary...");
    const result = await uploadOnCloudinary(req.file.path);
    if (!result.url) {
      console.log("Cloudinary upload failed");
      return res.status(500).json({ error: "Failed to upload prescription" });
    }
    console.log("Cloudinary upload successful:", result.url);

    // Step 2: Run OCR on the uploaded image
    const worker = await createWorker("eng");
    const { data: { text: ocrText } } = await worker.recognize(req.file.path);
    await worker.terminate();

    // Step 3: Create prescription record with OCR text
    const prescription = await Prescription.create({
      user_id: req.user._id,
      image_url: result.url,
      ocr_text: ocrText,
      status: "processing",
      extracted_medications: []
    });

    // Step 4: Run Gemini extraction
    const extractedMedications = await extractMedicationsFromPrescription(ocrText);
    prescription.extracted_medications = extractedMedications;
    prescription.status = "completed";
    await prescription.save();

    // Step 5: Save medications to Medication table
    if (extractedMedications && extractedMedications.length > 0) {
      await Medication.insertMany(
        extractedMedications.map(med => ({
          user_id: req.user._id,
          medicine_name: med.medicine_name || med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          timing: med.timing || [],
          start_date: new Date(),
          end_date: new Date(),
          stock_count: 0,
          refill_alert_threshold: 10,
          prescription_id: prescription._id
        }))
      );
    }

    return res.status(201).json({
      success: true,
      prescription,
      ocrResult: {
        text: ocrText,
        audioUrl: null
      },
      extractedMedications
    });

  } catch (error) {
    console.error("Upload prescription error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const extractMedicationsFromText = (text) => {
  // Enhanced medication extraction logic
  const medications = [];
  
  // Simple regex pattern (would be more sophisticated in production)
  const medPattern = /([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)\s*([\d\.]+\s*(?:mg|g|ml)?)\s*(?:,\s*|\s+)(?:take\s*)?([\d\.]+\s*(?:times)?\s*(?:per|a)\s*(?:day|week))/gi;
  
  let match;
  while ((match = medPattern.exec(text)) !== null) {
    medications.push({
      name: match[1].trim(),
      dosage: match[2].trim(),
      frequency: match[3].trim(),
      extractedText: match[0]
    });
  }

  return medications;
};

export const processPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findOne({ 
      _id: id, 
      user_id: req.user._id 
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    // If OCR text already exists, use it
    let textToProcess = prescription.ocr_text;
    
    // If no OCR text but we have image, process it
    if (!textToProcess && prescription.image_url) {
      // Note: In a real implementation, you might want to download the image
      // from Cloudinary first, but we'll use the existing OCR text here
      return res.status(400).json({ 
        error: "OCR text not available. Please re-upload the prescription." 
      });
    }

    const extractedMeds = extractMedicationsFromText(textToProcess);
    prescription.extracted_medications = extractedMeds;
    await prescription.save();

    return res.status(200).json({
      success: true,
      prescription,
      extractedCount: extractedMeds.length
    });

  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const createMedicationsFromPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmAll = true } = req.body;

    const prescription = await Prescription.findOne({
      _id: id,
      user_id: req.user._id
    }).populate('extracted_medications.linked_medication_id');

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    const createdMeds = [];
    const errors = [];

    for (const med of prescription.extracted_medications) {
      try {
        // Skip if already linked
        if (med.linked_medication_id) {
          continue;
        }

        // In a real app, you might have user confirmation for each medication
        if (confirmAll) {
          const newMed = await Medication.create({
            user_id: req.user._id,
            medicine_name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            prescription_id: prescription._id,
            timing: ['morning', 'evening'] // Default timing
          });

          med.linked_medication_id = newMed._id;
          createdMeds.push(newMed);
        }
      } catch (error) {
        errors.push({
          medication: med.name,
          error: error.message
        });
      }
    }

    await prescription.save();

    return res.status(201).json({
      success: true,
      createdCount: createdMeds.length,
      medications: createdMeds,
      errors,
      prescription
    });

  } catch (error) {
    return res.status(500).json({ 
      error: error.message,
    });
  }
};

export const processPrescriptionWithGemini = async (req, res) => {
  try {
    const { id } = req.params;
    
    const prescription = await Prescription.findOne({ 
      _id: id, 
      user_id: req.user._id 
    });

    if (!prescription) {
      return res.status(404).json({ error: "Prescription not found" });
    }

    if (!prescription.ocr_text) {
      return res.status(400).json({ 
        error: "OCR text not available. Please ensure the prescription was uploaded successfully." 
      });
    }

    // Use Gemini to extract medications from OCR text
    const extractedMedications = await extractMedicationsFromPrescription(prescription.ocr_text);

    // Update prescription with extracted medications
    prescription.extracted_medications = extractedMedications;
    prescription.status = "completed";
    await prescription.save();

    return res.status(200).json({
      success: true,
      prescription,
      extractedCount: extractedMedications.length,
      extractedMedications
    });

  } catch (error) {
    console.error("Gemini processing error:", error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ 
      user_id: req.user._id 
    })
    .populate('extracted_medications.linked_medication_id')
    .sort({ upload_time: -1 }); // Most recent first

    return res.status(200).json({
      success: true,
      prescriptions
    });

  } catch (error) {
    console.error("Get prescriptions error:", error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};