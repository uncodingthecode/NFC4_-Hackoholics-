import Family from "../models/family.model.js";
import { sendEmergencyEmail, testEmailConfig } from "../utils/emailService.js";

export const getEmergencyInfo = async (req, res) => {
  try {
    const family = await Family.findById(req.user.family_id)
      .populate('head_id', 'name email')
      .populate('members', 'name email role');

    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    return res.status(200).json(family);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const shareEmergencyInfo = async (req, res) => {
  try {
    const { contactId } = req.params;
    const family = await Family.findById(req.user.family_id);

    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const contact = family.emergency_contacts.find(c => c._id.toString() === contactId);
    if (!contact) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    // Send emergency info email
    if (contact.email) {
      await sendEmergencyEmail(family, "emergency_alert", "Emergency information shared", {
        name: req.user.name
      });
    }

    return res.status(200).json({ 
      message: "Emergency information shared successfully",
      contact: contact
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Test email service
export const testEmailService = async (req, res) => {
  try {
    const isConfigValid = await testEmailConfig();
    
    if (!isConfigValid) {
      return res.status(500).json({ 
        error: "Email configuration is invalid. Check EMAIL_USER and EMAIL_PASSWORD in .env" 
      });
    }

    const family = await Family.findById(req.user.family_id);
    if (!family || !family.emergency_contacts.length) {
      return res.status(404).json({ error: "No emergency contacts found" });
    }

    // Send test email to first emergency contact
    const testContact = family.emergency_contacts[0];
    if (testContact.email) {
      await sendEmergencyEmail(family, "emergency_alert", "This is a test email from Health Dashboard", {
        name: req.user.name
      });
      
      return res.status(200).json({ 
        message: "Test email sent successfully",
        sentTo: testContact.email
      });
    } else {
      return res.status(400).json({ error: "Emergency contact has no email address" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};