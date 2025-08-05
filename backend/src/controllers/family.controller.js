import  Family  from "../models/family.model.js";
import  User  from "../models/user.model.js";

export const createFamily = async (req, res) => {
  try {
    const { name } = req.body;
    const headId = req.user._id;

    if (!name) {
      return res.status(400).json({ error: "Family name is required" });
    }

    const family = await Family.create({
      name,
      head_id: headId,
      members: [headId]
    });

    await User.findByIdAndUpdate(headId, { role: 'head', family_id: family._id });

    return res.status(201).json(family);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFamilyDetails = async (req, res) => {
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

export const addFamilyMember = async (req, res) => {
  try {
    const { email } = req.body;
    const familyId = req.user.family_id;

    if (!email) {
      return res.status(400).json({ error: "Member email is required" });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: "User not found" });
    }

    if (userToAdd.family_id) {
      return res.status(400).json({ error: "User already belongs to a family" });
    }

    await Family.findByIdAndUpdate(familyId, {
      $addToSet: { members: userToAdd._id }
    });

    await User.findByIdAndUpdate(userToAdd._id, {
      family_id: familyId,
      role: 'member'
    });

    return res.status(200).json({ message: "Member added successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateEmergencyContacts = async (req, res) => {
  try {
    const { contacts } = req.body;

    if (!contacts || !Array.isArray(contacts)) {
      return res.status(400).json({ error: "Valid contacts array is required" });
    }

    const family = await Family.findByIdAndUpdate(
      req.user.family_id,
      { emergency_contacts: contacts },
      { new: true }
    );

    return res.status(200).json(family);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/families/emergency-contacts
export const addEmergencyContact = async (req, res) => {
  try {
    const { name, relation, email, phone } = req.body;

    if (!name || !relation || !email) {
      return res.status(400).json({ error: "Name, relation, and email are required" });
    }

    const family = await Family.findById(req.user.family_id);
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const newContact = {
      name,
      relation,
      email,
      phone: phone || ""
    };

    family.emergency_contacts.push(newContact);
    await family.save();

    return res.status(201).json({
      message: "Emergency contact added successfully",
      contact: newContact
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// PUT /api/v1/families/emergency-contacts/:contactId
export const updateEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { name, relation, email, phone } = req.body;

    if (!name || !relation || !email) {
      return res.status(400).json({ error: "Name, relation, and email are required" });
    }

    const family = await Family.findById(req.user.family_id);
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const contactIndex = family.emergency_contacts.findIndex(
      contact => contact._id.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    family.emergency_contacts[contactIndex] = {
      ...family.emergency_contacts[contactIndex],
      name,
      relation,
      email,
      phone: phone || ""
    };

    await family.save();

    return res.status(200).json({
      message: "Emergency contact updated successfully",
      contact: family.emergency_contacts[contactIndex]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// DELETE /api/v1/families/emergency-contacts/:contactId
export const deleteEmergencyContact = async (req, res) => {
  try {
    const { contactId } = req.params;

    const family = await Family.findById(req.user.family_id);
    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    const contactIndex = family.emergency_contacts.findIndex(
      contact => contact._id.toString() === contactId
    );

    if (contactIndex === -1) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    const deletedContact = family.emergency_contacts[contactIndex];
    family.emergency_contacts.splice(contactIndex, 1);
    await family.save();

    return res.status(200).json({
      message: "Emergency contact deleted successfully",
      deletedContact
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};