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

    return res.status(200).json(emergencyInfo);
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

    // Find contact by ID and extract email
    const contact = family?.emergency_contacts.find(c => c._id.toString() === contactId);
    const contactEmail = contact?.email || process.env.DEFAULT_EMERGENCY_EMAIL;

    if (!contactEmail) {
      return res.status(400).json({ error: "Emergency contact email not found" });
    }

    const emailText = `
Emergency Information for ${emergencyInfo.name}:

Blood Group: ${emergencyInfo.bloodGroup}
Allergies: ${emergencyInfo.allergies.join(', ') || 'None'}
Existing Conditions: ${emergencyInfo.conditions.join(', ') || 'None'}
Medications:
${emergencyInfo.medications.map(m => `- ${m.name} (${m.dosage})`).join('\n')}

Emergency Contacts:
${emergencyInfo.emergencyContacts.map(c => `${c.name} - ${c.phone}`).join('\n')}
`;

    await sendEmergencyEmail(contactEmail, "Emergency Medical Info", emailText);

    return res.status(200).json({
      message: "Emergency info emailed successfully",
      sharedWith: contactEmail
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};
