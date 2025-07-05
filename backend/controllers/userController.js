import User from "../models/User.js";
import Leave from "../models/Leave.js";
import bcrypt from "bcrypt";
import Employee from "../models/Employee.js";

// Controller to get all users data
const getUsersData = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    return res.json({
      success: true,
      users,
      message: "User Data fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const getUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId }).populate('userId department')
    return res.json({
      success: true,
      employee,
      message: "User Data fetched Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const deleteUserData = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete({ _id: userId });
    return res.json({
      success: true,
      message: "User Data deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Wrong Old Password!" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      userId,
      { password: hashPassword },
      { new: true }
    );

    return res.json({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};


export {
  getUsersData,
  getUserData,
  deleteUserData,
  updatePassword,
};
