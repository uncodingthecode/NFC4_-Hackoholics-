import  Prescription  from "../models/prescription.model.js";
import  Medication  from "../models/medication.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { processOCR } from "./ocr.controller.js";
import { extractMedicationsFromPrescription } from "../utils/geminiService.js";
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import path from 'path';
import gtts from 'gtts';

export const uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Prescription image is required" });
    }

    // Step 1: Upload to Cloudinary for storage
    const result = await uploadOnCloudinary(req.file.path);
    if (!result.url) {
      return res.status(500).json({ error: "Failed to upload prescription" });
    }

    let ocrText = "";
    let audioUrl = null;

    // Step 2: Process OCR directly
    const imagePath = req.file.path;
    console.log("Processing OCR for file:", imagePath);
    console.log("File exists:", fs.existsSync(imagePath));
    
    if (!fs.existsSync(imagePath)) {
      console.log("File not found, skipping OCR");
    } else {
      console.log("File size:", fs.statSync(imagePath).size, "bytes");
      
      const worker = await createWorker("eng");
      
      try {
        const { data: { text } } = await worker.recognize(imagePath);
        await worker.terminate();
        
        console.log("OCR raw text:", text);
        console.log("OCR text length:", text ? text.length : 0);
        
        if (text && text.trim()) {
          ocrText = text.trim();
          
          // Generate audio if text exists
          const audioDir = path.join(__dirname, "..", "tts_output");
          fs.mkdirSync(audioDir, { recursive: true });
          
          const audioFile = `${Date.now()}.mp3`;
          const audioPath = path.join(audioDir, audioFile);
          
          const tts = new gtts(ocrText, "en");
          await new Promise((resolve, reject) => {
            tts.save(audioPath, (err) => {
              if (err) {
                reject(err);
              } else {
                audioUrl = `/audio/${audioFile}`;
                resolve();
              }
            });
          });
        } else {
          console.log("OCR returned empty or null text");
        }
      } catch (ocrError) {
        console.error("OCR processing error:", ocrError);
        // Continue without OCR text if it fails
      }
    }

    // Step 3: Create prescription record
    const prescription = await Prescription.create({
      user_id: req.user._id,
      image_url: result.url,
      ocr_text: ocrText,
      audio_url: audioUrl
    });

    // Keep the local file for manual cleanup
    console.log("Local file kept for manual cleanup:", req.file.path);

    return res.status(201).json({
      success: true,
      prescription,
      ocrResult: {
        text: ocrText,
        audioUrl: audioUrl
      }
    });

  } catch (error) {
    console.error("Upload prescription error:", error);
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