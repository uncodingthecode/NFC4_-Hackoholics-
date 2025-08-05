import Family from "../models/family.model.js";
import Profile from "../models/profile.model.js";
import Medication from "../models/medication.model.js";
import { sendEmergencyEmail } from "../utils/mailer.js";

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
