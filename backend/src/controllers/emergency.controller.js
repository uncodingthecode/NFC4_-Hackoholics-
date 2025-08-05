import  Family  from "../models/family.model.js";
import  Profile  from "../models/profile.model.js";
import  Medication  from "../models/medication.model.js";

export const getEmergencyInfo = async (req, res) => {
  try {
    const [family, profile, medications] = await Promise.all([
      Family.findById(req.user.family_id),
      Profile.findOne({ user_id: req.user._id }),
      Medication.find({ user_id: req.user._id })
    ]);

    const emergencyInfo = {
      name: req.user.name,
      bloodGroup: profile?.blood_group,
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
    return res.status(500).json({ error: error.message });
  }
};

export const shareEmergencyInfo = async (req, res) => {
  try {
    const { contactId } = req.params;
    // In a real implementation, this would send the info via SMS/email
    // or generate a shareable link with limited-time access
    
    const emergencyInfo = await getEmergencyInfo(req); // Reuse the above function
    return res.status(200).json({
      message: "Emergency info shared successfully",
      sharedWith: contactId,
      info: emergencyInfo
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};