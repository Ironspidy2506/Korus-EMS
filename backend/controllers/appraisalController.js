import Appraisal from "../models/Appraisal.js";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Controller to Get all appraisals
const getAppraisals = async (req, res) => {
  try {
    const appraisals = await Appraisal.find()
      .populate("supervisor")
      .populate("employeeId")
      .populate("department");

    res.json({
      success: true,
      appraisals,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Controller to Add a new appraisal
const addAppraisal = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      department,
      accomplishments,
      supervisor,
      supervisorComments,
      ratings,
      totalRating,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    const empDepartment = await Department.findById(department);

    const leads = await Employee.find({ _id: { $in: supervisor } });

    const newAppraisal = new Appraisal({
      employeeId: employee,
      department: empDepartment,
      employeeName,
      accomplishments,
      supervisor: leads,
      supervisorComments,
      ratings,
      totalRating,
    });

    await newAppraisal.save();

    res.json({
      success: true,
      message: "Appraisal added successfully",
      appraisal: newAppraisal,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Controller to Edit/update an existing appraisal
const editAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      employeeId,
      employeeName,
      department,
      accomplishments,
      supervisor,
      supervisorComments,
      ratings,
      totalRating,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    const empDepartment = await Department.findById(department);
    const leads = await Employee.find({ _id: { $in: supervisor } });

    const updatedData = {
      employeeId: employee,
      employeeName,
      department: empDepartment,
      accomplishments,
      supervisor: leads,
      supervisorComments,
      ratings,
      totalRating,
    };

    const updatedAppraisal = await Appraisal.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedAppraisal) {
      return res.json({ success: false, message: "Appraisal not found" });
    }

    res.json({
      success: true,
      message: "Appraisal updated successfully",
    });
  } catch (error) {
    console.log(error);

    res.json({ success: false, message: error.message });
  }
};

// Controller to Delete an appraisal
const deleteAppraisal = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAppraisal = await Appraisal.findByIdAndDelete(id);

    if (!deletedAppraisal) {
      return res.json({ success: false, message: "Appraisal not found" });
    }

    res.json({
      success: true,
      message: "Appraisal deleted successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// Controller to get user appraisals
const getUserAppraisals = async (req, res) => {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({ userId });
    const empId = employee._id;

    const appraisals = await Appraisal.find({ employeeId: empId })
      .populate("employeeId")
      .populate("department")
      .populate("supervisor")

    if (!appraisals) {
      return res.json({
        success: false,
        message: "No Appraisal Data Found!",
      });
    }

    res.json({
      success: true,
      appraisals,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Controller to get team lead appraisals
const getAppraisalsTeamLead = async (req, res) => {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({ userId });
    const empId = employee._id;

    const appraisals = await Appraisal.find({ supervisor: { $in: [empId] } })
      .populate("supervisor")
      .populate("employeeId")
      .populate("department");

    if (appraisals.length === 0) {
      return res.json({
        success: false,
        message: "No Appraisal Data Found!",
      });
    }

    res.json({
      success: true,
      appraisals,
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  addAppraisal,
  editAppraisal,
  deleteAppraisal,
  getAppraisals,
  getUserAppraisals,
  getAppraisalsTeamLead
};
