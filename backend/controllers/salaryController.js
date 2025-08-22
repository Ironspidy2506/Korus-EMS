import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

// Constroller to get all salaries
export const getAllSalaries = async (req, res) => {
  try {
    const salaries = await Salary.find({})
      .populate({
        path: "employeeId",
        populate: { path: "department" },
      })
      .sort({ createdAt: -1 });
    return res.json({
      success: true,
      salaries,
      message: "All salaries fetched successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};

// Controller to add a new salary 
export const addSalary = async (req, res) => {
  try {
    const {
      employeeId,
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      allowances,
      deductions,
      paymentMonth,
      paymentYear,
    } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.json({ success: false, message: "Employee not found" });
    }
    const salary = await Salary.findOne({
      employeeId,
      paymentMonth,
      paymentYear,
    });
    if (salary) {
      return res.json({
        success: false,
        message: "Salary Details Already Available!",
      });
    }
    const newSalary = new Salary({
      employeeId,
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      allowances,
      deductions,
      paymentMonth,
      paymentYear,
    });
    await newSalary.save();
    res.json({ success: true, message: "Salary Added Successfully!" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: "Server error" });
  }
};

// Controller to update a salary
export const updateSalary = async (req, res) => {
  try {
    const { _id } = req.params;
    const {
      employeeId,
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      paymentMonth,
      paymentYear,
      allowances,
      deductions,
    } = req.body;

    const salary = await Salary.findOne({
      employeeId,
      paymentMonth,
      paymentYear,
    });

    if (!salary) {
      return res.json({ success: false, message: "Salary details not found" });
    }
    if (employeeType !== undefined) salary.employeeType = employeeType;
    if (grossSalary !== undefined) salary.grossSalary = grossSalary;
    if (basicSalary !== undefined) salary.basicSalary = basicSalary;
    if (payableDays !== undefined) salary.payableDays = payableDays;
    if (paymentMonth !== undefined) salary.paymentMonth = paymentMonth;
    if (paymentYear !== undefined) salary.paymentYear = paymentYear;
    if (allowances !== undefined) salary.allowances = allowances;
    if (deductions !== undefined) salary.deductions = deductions;
    await salary.save();
    
    res.json({ success: true, message: "Salary updated successfully" });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.json({ success: false, message: "Server error" });
  }
};

// Controller to delete a salary
export const deleteSalary = async (req, res) => {
  try {
    const { _id } = req.params;
    await Salary.findByIdAndDelete(_id);
    res.json({ success: true, message: "Salary deleted successfully" });
  } catch (error) {
    console.error("Error deleting salary:", error);
    res.json({ success: false, message: "Server error" });
  }
};

// Controller to get user salaries
export const getUserSalaries = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });

    const salaries = await Salary.find({ employeeId: employee._id })
      .populate({
        path: "employeeId",
        populate: { path: "department" },
      })
      .sort({ createdAt: -1 });
    return res.json({
      success: true,
      salaries,
      message: "User salaries fetched successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message
    });
  }
};