import User from "../models/User.js";
import bcrypt from "bcrypt";
import transporter from "../config/nodemailer.js";

// Verify salary password
const verifySalaryPassword = async (req, res) => {
  try {
    const { salaryPassword } = req.body;
    const userId = req.user._id; // Get from auth middleware

    if (!salaryPassword) {
      return res.json({
        success: false,
        message: "Salary password is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // If no salary password is set, allow access (first time)
    if (!user.salaryPassword || user.salaryPassword === "") {
      return res.json({
        success: true,
        message: "No salary password set. Please set one for future access.",
        requiresPasswordSet: true,
      });
    }

    const isMatch = await bcrypt.compare(salaryPassword, user.salaryPassword);
    if (!isMatch) {
      return res.json({
        success: false,
        message: "Incorrect salary password",
      });
    }

    res.json({
      success: true,
      message: "Salary password verified successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Set salary password (first time or change)
const setSalaryPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user._id; // Get from auth middleware

    if (!newPassword) {
      return res.json({
        success: false,
        message: "New password is required",
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.salaryPassword = hashPassword;
    await user.save();

    res.json({
      success: true,
      message: "Salary password set successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
};

// Send salary password reset OTP
const sendSalaryPasswordResetOtp = async (req, res) => {
  try {
    const userId = req.user._id; // Get from auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store OTP in user document temporarily
    user.salaryPasswordResetOtp = otp;
    user.salaryPasswordResetOtpExpiry = otpExpiry;
    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Salary Access Password Reset OTP",
      text: `Your Salary Access Password Reset OTP is ${otp}. Use this OTP to reset your salary password. It will expire in 15 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: `Password reset OTP sent to ${user.email}`,
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// Reset salary password using OTP
const resetSalaryPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const userId = req.user._id; // Get from auth middleware

    if (!otp || !newPassword) {
      return res.json({
        success: false,
        message: "OTP and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.salaryPasswordResetOtp || user.salaryPasswordResetOtp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.salaryPasswordResetOtpExpiry < Date.now()) {
      return res.json({
        success: false,
        message: "OTP expired",
      });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.salaryPassword = hashPassword;
    user.salaryPasswordResetOtp = "";
    user.salaryPasswordResetOtpExpiry = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Salary password reset successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  verifySalaryPassword,
  setSalaryPassword,
  sendSalaryPasswordResetOtp,
  resetSalaryPassword,
};
