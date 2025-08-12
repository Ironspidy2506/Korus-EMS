import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "accounts", "hr", "employee", "lead"],
    required: true,
  },
  profileImage: {
    type: String,
  },
  resetOtp: {
    type: String,
    default: "",
  },
  resetOtpExpireAt: {
    type: Number,
    default: 0,
  },
  salaryPassword: {
    type: String,
    default: "",
  },
  salaryPasswordResetOtp: {
    type: String,
    default: "",
  },
  salaryPasswordResetOtpExpiry: {
    type: Number,
    default: 0,
  },
},
  {
    timestamps: true,
  }
);

const User = mongoose.model("user", userSchema);
export default User;
