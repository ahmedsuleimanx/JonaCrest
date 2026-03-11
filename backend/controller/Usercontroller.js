import express from "express";
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import validator from "validator";
import crypto from "crypto";
import userModel from "../models/Usermodel.js";
import transporter from "../config/nodemailer.js";
import { getWelcomeTemplate } from "../email.js";
import { getPasswordResetTemplate } from "../email.js";

const backendurl = process.env.BACKEND_URL;

const createtoken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

dotenv.config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const Registeruser = await userModel.findOne({ email });
    if (!Registeruser) {
      return res.json({ message: "Email not found", success: false });
    }
    const isMatch = await bcrypt.compare(password, Registeruser.password);
    if (isMatch) {
      const token = createtoken(Registeruser._id);
      return res.json({ 
        token, 
        user: { 
          _id: Registeruser._id,
          name: Registeruser.name, 
          email: Registeruser.email, 
          role: Registeruser.role,
          isPaid: Registeruser.isPaid 
        }, 
        success: true 
      });
    } else {
      return res.json({ message: "Invalid password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ message: "Server error", success: false });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!validator.isEmail(email)) {
      return res.json({ message: "Invalid email", success: false });
    }
    
    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "Email already registered", success: false });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new userModel({ 
      name, 
      email, 
      password: hashedPassword,
      role: 'user',
      isPaid: true
    });
    await newUser.save();
    const token = createtoken(newUser._id);

    // send email
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Welcome to Jona Crest Properties - Your Account Has Been Created",
      html: getWelcomeTemplate(name)
    };

    await transporter.sendMail(mailOptions);

    return res.json({ 
      token, 
      user: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, isPaid: newUser.isPaid },
      success: true 
    });
  } catch (error) {
    console.error(error);
    return res.json({ message: "Server error", success: false });
  }
};

const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found", success: false });
    }
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.WEBSITE_URL}/reset/${resetToken}`;
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Password Reset - Jona Crest Properties Security",
      html: getPasswordResetTemplate(resetUrl)
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token", success: false });
    }
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successful", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const adminlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, success: true });
    } else {
      return res.status(400).json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

const logout = async (req, res) => {
    try {
        return res.json({ message: "Logged out", success: true });
    } catch (error) {
        console.error(error);
        return res.json({ message: "Server error", success: false });
    }
};

// get name and email

const getname = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("-password").populate('savedProperties');
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    // Return user object with _id explicitly as string for consistent frontend access
    return res.json({
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isPaid: user.isPaid,
      phone: user.phone,
      profileImage: user.profileImage,
      savedProperties: user.savedProperties
    });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
}

// Toggle saved property
const toggleSavedProperty = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const savedIndex = user.savedProperties?.indexOf(propertyId);
    let isSaved = false;

    if (savedIndex > -1) {
      user.savedProperties.splice(savedIndex, 1);
    } else {
      user.savedProperties = user.savedProperties || [];
      user.savedProperties.push(propertyId);
      isSaved = true;
    }

    await user.save();
    return res.json({ 
      success: true, 
      isSaved, 
      message: isSaved ? 'Property saved' : 'Property removed',
      savedProperties: user.savedProperties 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all saved properties
const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userModel.findById(userId).populate('savedProperties');
    return res.json({ 
      success: true, 
      savedProperties: user.savedProperties || [] 
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone } = req.body;

    const user = await userModel.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true }
    ).select('-password');

    return res.json({ success: true, user, message: 'Profile updated' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export { login, register, forgotpassword, resetpassword, adminlogin, logout, getname, toggleSavedProperty, getSavedProperties, updateProfile };