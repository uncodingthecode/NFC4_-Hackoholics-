import { User } from "../models/user.model.js";
import { Family } from "../models/family.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Helper function to generate tokens
const generateTokens = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// User Registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, family_id } = req.body;

    // Validation
    if (!name || !email || !password || !role || !family_id) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Check if family exists
    const familyExists = await Family.findById(family_id);
    if (!familyExists) {
      return res.status(404).json({ error: "Family not found" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password_hash: password, // Will be hashed by pre-save hook
      role,
      family_id
    });

    // Remove sensitive data from response
    const createdUser = await User.findById(user._id).select("-password_hash -refreshToken");

    return res.status(201).json({
      success: true,
      data: createdUser,
      message: "User registered successfully"
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ error: error.message || "Registration failed" });
  }
};

// User Login
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
        success: true,
        data: {
          user: loggedInUser,
          accessToken,
          refreshToken
        },
        message: "Login successful"
      });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: error.message || "Login failed" });
  }
};

// User Logout
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
      .json({ success: true, message: "Logged out successfully" });

  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: error.message || "Logout failed" });
  }
};

// Refresh Access Token
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
      .json({
        success: true,
        data: { accessToken, refreshToken: newRefreshToken },
        message: "Access token refreshed"
      });

  } catch (error) {
    console.error("Refresh token error:", error);
    return res.status(401).json({ error: error.message || "Invalid refresh token" });
  }
};

// Change Password
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

    return res.status(200).json({ success: true, message: "Password changed successfully" });

  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ error: error.message || "Password change failed" });
  }
};

// Get Current User
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash -refreshToken");
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: error.message || "Failed to get user" });
  }
};

// Update User Details
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

    return res.status(200).json({
      success: true,
      data: user,
      message: "User details updated successfully"
    });

  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: error.message || "Update failed" });
  }
};

// Get Family Members
export const getFamilyMembers = async (req, res) => {
  try {
    const familyId = req.user.family_id;
    const members = await User.find({ family_id: familyId }).select("-password_hash -refreshToken");

    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("Get family members error:", error);
    return res.status(500).json({ error: error.message || "Failed to get family members" });
  }
};