import  Profile  from "../models/profile.model.js";

export const createOrUpdateProfile = async (req, res) => {
  try {
    const { DOB, height, weight, gender, blood_group, allergies, existing_conditions, family_doctor_email } = req.body;

    const profileData = {
      user_id: req.user._id,
      DOB,
      height,
      weight,
      gender,
      blood_group,
      family_doctor_email,
      allergies,
      existing_conditions
    };

    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      profileData,
      { upsert: true, new: true }
    );

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id })
      .populate('medications');

    if (!profile) {
      // Return empty profile structure instead of error
      return res.status(200).json({
        _id: null,
        user_id: req.user._id,
        DOB: null,
        height: null,
        weight: null,
        gender: null,
        blood_group: null,
        family_doctor_email: [],
        allergies: [],
        existing_conditions: [],
        medications: [],
        createdAt: null,
        updatedAt: null
      });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addFamilyDoctor = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Doctor email is required" });
    }

    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      { $addToSet: { family_doctor_email: email } },
      { new: true, upsert: true }
    );

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};