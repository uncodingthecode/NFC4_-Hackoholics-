import Family from "../models/family.model.js";
import Profile from "../models/profile.model.js";
import Medication from "../models/medication.model.js";
import { sendEmergencyEmail } from "../utils/mailer.js";
import { healthChatbot } from "../utils/geminiService.js";

// ✅ GET /api/emergency/
export const getEmergencyInfo = async (req, res) => {
  try {
    const [family, profile, medications] = await Promise.all([
      Family.findById(req.user.family_id),
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id }),
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
      emergencyContacts: family?.emergency_contacts || [],
    };

    return res.status(200).json(emergencyInfo);
  } catch (error) {
    console.error("❌ getEmergencyInfo error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ POST /api/emergency/share/:contactId
export const shareEmergencyInfo = async (req, res) => {
  try {
    const { contactId } = req.params;

    const [family, profile, medications] = await Promise.all([
      Family.findById(req.user.family_id),
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id }),
    ]);

    const contact = family?.emergency_contacts.find(
      c => c._id?.toString() === contactId
    );
    const contactEmail = contact?.email || process.env.DEFAULT_EMERGENCY_EMAIL;

    if (!contactEmail) {
      return res.status(400).json({ error: "Emergency contact email not found." });
    }

    const emailText = `
Emergency Information for ${req.user.name}

Blood Group: ${profile?.blood_group || 'Not Provided'}
Allergies: ${profile?.allergies?.join(', ') || 'None'}
Existing Conditions: ${profile?.existing_conditions?.join(', ') || 'None'}

Medications:
${
  medications.length > 0
    ? medications.map(m => `- ${m.medicine_name} (${m.dosage})`).join('\n')
    : "None"
}

Sent to: ${contactEmail}
    `.trim();

    await sendEmergencyEmail(contactEmail, "Emergency Medical Info", emailText);

    return res.status(200).json({
      message: "Emergency info emailed successfully",
      sharedWith: contactEmail,
    });
  } catch (error) {
    console.error("❌ shareEmergencyInfo error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ POST /api/emergency/mail-contacts
export const mailEmergencyContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ error: "No contacts provided." });
    }

    const emails = contacts.filter(e => typeof e === 'string' && e.includes("@"));

    if (emails.length === 0) {
      return res.status(400).json({ error: "No valid email addresses found." });
    }

    const [profile, medications] = await Promise.all([
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id }),
    ]);

    const emailText = `
Emergency Health Summary for ${req.user.name}

Email: ${req.user.email}
Blood Group: ${profile?.blood_group || 'Not Provided'}
Allergies: ${profile?.allergies?.join(', ') || 'None'}
Conditions: ${profile?.existing_conditions?.join(', ') || 'None'}

Medications:
${
  medications.length > 0
    ? medications.map(m => `- ${m.medicine_name} (${m.dosage})`).join('\n')
    : "None"
}

Sent on: ${new Date().toLocaleString()}
    `.trim();

    const emailPromises = emails.map(email =>
      sendEmergencyEmail(email, "🩺 Emergency Medical Info", emailText)
    );

    await Promise.all(emailPromises);

    return res.status(200).json({
      message: "Emergency info sent successfully.",
      recipients: emails,
    });
  } catch (error) {
    console.error("❌ mailEmergencyContacts error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// ✅ POST /api/emergency/share-summary
export const shareSummary = async (req, res) => {
  try {
    const defaultEmail = process.env.EMERGENCY_RECEIVER_EMAIL;

    if (!defaultEmail || !defaultEmail.includes("@")) {
      return res.status(500).json({ error: "EMERGENCY_RECEIVER_EMAIL is missing or invalid." });
    }

    const [profile, medications] = await Promise.all([
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id }),
    ]);

    const summaryText = `
Health Summary for ${req.user.name}

Email: ${req.user.email}
Blood Group: ${profile?.blood_group || "Not Provided"}
Allergies: ${profile?.allergies?.join(", ") || "None"}
Conditions: ${profile?.existing_conditions?.join(", ") || "None"}

Current Medications:
${
  medications.length > 0
    ? medications.map(m => `- ${m.medicine_name} (${m.dosage})`).join("\n")
    : "None"
}

Sent on: ${new Date().toLocaleString()}
    `.trim();

    await sendEmergencyEmail(defaultEmail, "🩺 Emergency Health Summary", summaryText);

    return res.status(200).json({
      message: "Health summary sent to configured email.",
      sentTo: defaultEmail,
    });
  } catch (error) {
    console.error("❌ shareSummary error:", error);
    return res.status(500).json({ error: "Failed to send summary email." });
  }
};

// ✅ GET /api/emergency/test
export const testEmergency = async (req, res) => {
  try {
    return res.status(200).json({
      message: "Emergency test endpoint working",
      user: {
        id: req.user._id,
        name: req.user.name,
        family_id: req.user.family_id,
      },
    });
  } catch (error) {
    console.error("❌ testEmergency error:", error);
    return res.status(500).json({ error: error.message });
  }
};

// Generate AI summary for health reports
export const generateHealthReportSummary = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

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
