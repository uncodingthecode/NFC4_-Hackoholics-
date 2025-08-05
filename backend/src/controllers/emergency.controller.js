import Family from "../models/family.model.js";
import Profile from "../models/profile.model.js";
import Medication from "../models/medication.model.js";
import { sendEmergencyEmail } from "../utils/mailer.js";
import { healthChatbot } from "../utils/geminiService.js";

// GET /api/emergency/
export const getEmergencyInfo = async (req, res) => {
  try {
    const [family, profile, medications] = await Promise.all([
      Family.findById(req.user.family_id),
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id })
    ]);

    const emergencyInfo = {
      name: req.user.name,
      bloodGroup: profile?.blood_group || 'Not Provided',
      allergies: profile?.allergies || [],
      conditions: profile?.existing_conditions || [],
      medications: medications.map(m => ({
        name: m.medicine_name,
        dosage: m.dosage
      })),
      emergencyContacts: family?.emergency_contacts || []
    };

    return res.status(200).json(family);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/emergency/share/:contactId
export const shareEmergencyInfo = async (req, res) => {
  try {
    const { contactId } = req.params;

    const [family, profile, medications] = await Promise.all([
      Family.findById(req.user.family_id),
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id })
    ]);

    if (!family || family.emergency_contacts.length === 0) {
      console.warn("❌ No emergency contacts found for family:", family);
      return res.status(400).json({ error: "No emergency contact email available." });
    }

    const emergencyEmail = family.emergency_contacts[0]?.email; // Get first contact's email
    if (!emergencyEmail) {
      console.warn("❌ Emergency contact missing email field:", family.emergency_contacts[0]);
      return res.status(400).json({ error: "Emergency contact email missing." });
    }

    const subject = `🚨 Emergency Alert: ${profile.name}'s Health Status`;
    const text = `
    Patient Name: ${profile.name}
    BP: ${profile.bp_systolic}/${profile.bp_diastolic}
    Temperature: ${profile.temperature}
    Sugar Level: ${profile.sugar}
    Medications: ${medications.map(m => m.name).join(", ") || "None"}

    Please check on the patient immediately.
    `;

    await sendEmergencyEmail(emergencyEmail, subject, text);
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ shareEmergencyInfo error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Generate AI summary for health reports
export const generateHealthReportSummary = async (req, res) => {
  try {
    const { vitals, medications, profile, healthScoreData } = req.body;
    
    // Prepare data for AI analysis
    const healthData = {
      vitals: vitals || [],
      medications: medications || [],
      profile: profile || {},
      healthScoreData: healthScoreData || []
    };

    // Create a comprehensive prompt for the AI
    const userMessage = `Please analyze the following health data and provide a comprehensive AI-generated health summary report. Include insights, trends, recommendations, and any concerning patterns. Format the response with proper sections, bullet points, and clear headings.

Health Data:
- Patient Profile: ${JSON.stringify(profile)}
- Vital Signs: ${JSON.stringify(vitals)}
- Current Medications: ${JSON.stringify(medications)}
- Health Score Trend: ${JSON.stringify(healthScoreData)}

Please provide a detailed analysis including:
1. Overall Health Assessment
2. Vital Signs Analysis
3. Medication Management
4. Health Trends
5. Recommendations
6. Risk Factors (if any)
7. Next Steps`;

    const userContext = {
      name: profile?.user_id || "Patient",
      age: profile?.DOB ? Math.floor((new Date().getTime() - new Date(profile.DOB).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : "Not provided",
      bloodGroup: profile?.blood_group || "Not provided",
      conditions: [],
      medications: medications?.map(m => ({ name: m.medicine_name, dosage: m.dosage })) || []
    };

    const aiSummary = await healthChatbot(userMessage, userContext);

    res.status(200).json({
      success: true,
      summary: aiSummary
    });
  } catch (error) {
    console.error("Error generating health report summary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate health report summary",
      error: error.message
    });
  }
};
