import  User  from "../models/user.model.js";
import  Family  from "../models/family.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, familyId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    let family;
    if (role === "head") {
      family = await Family.create({ name: `${name}'s Family` });
      familyId = family._id;
    } else if (!familyId) {
      return res.status(400).json({ error: "Family ID is required for members" });
    }

    const user = await User.create({
      name,
      email,
      password_hash: password,
      role,
      family_id: familyId || family._id
    });

    if (role === "head") {
      await Family.findByIdAndUpdate(family._id, { head_id: user._id });
    }

    const createdUser = await User.findById(user._id).select("-password_hash -refreshToken");
    return res.status(201).json(createdUser);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password_hash -refreshToken");

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        user: loggedInUser,
        accessToken,
        refreshToken
      });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ message: "Logged out successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    if (!user || incomingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user._id);

    const options = {
      httpOnly: true,
      secure: true
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({ accessToken, refreshToken: newRefreshToken });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash -refreshToken");
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords are required" });
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid old password" });
    }

    user.password_hash = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({ message: "Password changed successfully" });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateUserDetails = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, email } },
      { new: true }
    ).select("-password_hash -refreshToken");

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getFamilyMembers = async (req, res) => {
  try {
    const family = await Family.findById(req.user.family_id)
      .populate('members', 'name email role');

    if (!family) {
      return res.status(404).json({ error: "Family not found" });
    }

    return res.status(200).json(family.members);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};