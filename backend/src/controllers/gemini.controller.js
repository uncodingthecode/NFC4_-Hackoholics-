import Prescription from "../models/prescription.model.js";
import Medication from "../models/medication.model.js";
import Profile from "../models/profile.model.js";
import { extractMedicationsFromPrescription, chatWithGemini as geminiChat, healthChatbot as geminiHealthChat } from "../utils/geminiService.js";

// Process prescription with Gemini AI
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

    if (!prescription.ocr_text || prescription.ocr_text.trim() === "") {
      return res.status(400).json({ 
        error: "No OCR text available. Please ensure the prescription was processed with OCR first." 
      });
    }

    // Extract medications using Gemini
    const extractedMedications = await extractMedicationsFromPrescription(prescription.ocr_text);
    
    if (extractedMedications.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No medications were extracted from the prescription",
        extractedMedications: [],
        prescription: prescription._id
      });
    }

    // Update prescription with extracted medications
    prescription.extracted_medications = extractedMedications;
    await prescription.save();

    return res.status(200).json({
      success: true,
      message: `Successfully extracted ${extractedMedications.length} medications`,
      extractedMedications,
      prescription: prescription._id
    });

  } catch (error) {
    console.error("Gemini prescription processing error:", error);
    return res.status(500).json({ 
      error: "Failed to process prescription with AI",
      details: error.message 
    });
  }
};

// General chatbot
export const chatWithGemini = async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await geminiChat(message, context);

    return res.status(200).json({
      success: true,
      response,
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Gemini chat error:", error);
    return res.status(500).json({ 
      error: "Failed to process chat request",
      details: error.message 
    });
  }
};

// Health-specific chatbot with user context
export const healthChatbot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Get user's health context
    const [profile, medications] = await Promise.all([
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id })
    ]);

    const userContext = {
      name: req.user.name,
      age: profile?.age,
      bloodGroup: profile?.blood_group,
      allergies: profile?.allergies || [],
      conditions: profile?.existing_conditions || [],
      medications: medications.map(m => ({
        name: m.medicine_name,
        dosage: m.dosage
      }))
    };

    const response = await geminiHealthChat(message, userContext);

    return res.status(200).json({
      success: true,
      response,
      userContext: {
        name: userContext.name,
        bloodGroup: userContext.bloodGroup,
        allergies: userContext.allergies,
        conditions: userContext.conditions,
        medicationCount: userContext.medications.length
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error("Health chatbot error:", error);
    return res.status(500).json({ 
      error: "Failed to process health chat request",
      details: error.message 
    });
  }
}; 