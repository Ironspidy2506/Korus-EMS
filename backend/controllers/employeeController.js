import path from "path";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import Department from "../models/Department.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import Allowance from "../models/Allowances.js";

// Controller for getting all employees
const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department");
    return res.json({ success: true, employees, message: "Employees fetched successfully" });
  } catch (error) {
    return res.json({ success: false, error: "Get Employee Server Error" });
  }
};

const addEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      korusEmail,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      hod,
      qualification,
      yop,
      contactNo,
      altContactNo,
      permanentAddress,
      localAddress,
      aadharNo,
      pan,
      passportNo,
      passportType,
      passportpoi,
      passportdoi,
      passportdoe,
      nationality,
      uan,
      pfNo,
      esiNo,
      bank,
      branch,
      ifsc,
      accountNo,
      repperson,
      role,
      password,
      doj,
    } = req.body;

    // Check if the email already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash the password before saving
    const hashPassword = await bcrypt.hash(password, 10);

    // Handle profile image (Convert to Base64)
    let profileImage = "";
    if (req.file) {
      profileImage = `data:${req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
    }

    // Create new User
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role: role.toLowerCase(),
      profileImage: profileImage, // Store Base64 image
    });

    const savedUser = await newUser.save();

    // Create new Employee
    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      name,
      email,
      korusEmail,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      hod,
      qualification,
      yop,
      contactNo,
      altContactNo,
      permanentAddress,
      localAddress,
      aadharNo,
      pan,
      passportNo,
      passportType,
      passportpoi,
      passportdoi,
      passportdoe,
      nationality,
      uan,
      pfNo,
      esiNo,
      bank,
      branch,
      ifsc,
      accountNo,
      repperson,
      role: role ? role.toLowerCase() : undefined,
      password: hashPassword,
      doj,
    });

    await newEmployee.save();

    return res.json({ success: true, message: "Employee Added Successfully!" });
  } catch (error) {
    return res.json({ success: false, error: "Add Employee Server Error" });
  }
};

// Controller for updating an employee
const updateEmployee = async (req, res) => {
  try {
    const { _id } = req.params;

    const {
      employeeId,
      name,
      email,
      korusEmail,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      hod,
      qualification,
      yop,
      contactNo,
      altContactNo,
      permanentAddress,
      localAddress,
      aadharNo,
      pan,
      passportNo,
      passportType,
      passportpoi,
      passportdoi,
      passportdoe,
      nationality,
      uan,
      pfNo,
      esiNo,
      bank,
      branch,
      ifsc,
      accountNo,
      repperson,
      role,
      doj,
    } = req.body;

    // Find the employee document by ID
    const employee = await Employee.findById(_id);
    if (!employee) {
      return res.json({ success: false, error: "Employee Not Found" });
    }

    // Find the associated user document
    const user = await User.findById(employee.userId);
    if (!user) {
      return res.json({ success: false, error: "User Not Found" });
    }

    // Handle profile image (Convert to Base64)
    let profileImage = user.profileImage; // Keep existing image if not updated
    if (req.file) {
      profileImage = `data:${req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
    }

    // Update the user document
    const updatedUserFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role: role.toLowerCase() }),
      ...(profileImage && { profileImage }), // Update image only if available
    };

    if (Object.keys(updatedUserFields).length > 0) {
      await User.findByIdAndUpdate(employee.userId, updatedUserFields);
    }

    // Prepare updated fields for the employee document
    const updatedEmployeeFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(korusEmail && { korusEmail }),
      ...(employeeId && { employeeId }),
      ...(dob && { dob }),
      ...(gender && { gender }),
      ...(maritalStatus && { maritalStatus }),
      ...(designation && { designation }),
      ...(department && { department }),
      ...(hod && { hod }),
      ...(qualification && { qualification }),
      ...(yop && { yop }),
      ...(contactNo && { contactNo }),
      ...(altContactNo && { altContactNo }),
      ...(permanentAddress && { permanentAddress }),
      ...(localAddress && { localAddress }),
      ...(aadharNo && { aadharNo }),
      ...(pan && { pan }),
      ...(passportNo && { passportNo }),
      ...(passportType && { passportType }),
      ...(passportpoi && { passportpoi }),
      ...(passportdoi && { passportdoi }),
      ...(passportdoe && { passportdoe }),
      ...(nationality && { nationality }),
      ...(uan && { uan }),
      ...(pfNo && { pfNo }),
      ...(esiNo && { esiNo }),
      ...(bank && { bank }),
      ...(branch && { branch }),
      ...(ifsc && { ifsc }),
      ...(accountNo && { accountNo }),
      ...(repperson && { repperson }),
      ...(role && { role: role.toLowerCase() }),
      ...(doj && { doj }),
    };

    // Update the employee document
    const updatedEmployee = await Employee.findByIdAndUpdate(
      _id,
      updatedEmployeeFields,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.json({ success: false, error: "Failed to update employee" });
    }

    return res.json({
      success: true,
      message: "Employee Updated Successfully!",
      data: updatedEmployee,
    });
  } catch (error) {
    return res.json({ success: false, error: "Edit Employee Server Error" });
  }
};

// Controller for deleting an employee
const deleteEmployee = async (req, res) => {
  try {
    const { _id } = req.params;

    const employee = await Employee.findOne({ _id });
    if (!employee) {
      return res.json({ success: false, message: "Employee not found" });
    }

    await employee.deleteOne();

    return res.json({ success: true, message: "Employee Deleted Successfully!" });
  } catch (error) {
    return res.json({ success: false, message: "Server error" });
  }
};

// Controller to update employee leave balances
const updateEmployeeLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { el, cl, sl, od, lwp, lhd, others } = req.body;

    // Validate employeeId
    if (!employeeId) {
      return res.status(400).json({ 
        success: false, 
        error: "Employee ID is required" 
      });
    }

    // Find employee by employeeId (not _id)
    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    const updatedLeaveBalance = {
      el: el !== undefined ? el : employee.leaveBalance.el,
      cl: cl !== undefined ? cl : employee.leaveBalance.cl,
      sl: sl !== undefined ? sl : employee.leaveBalance.sl,
      od: od !== undefined ? od : employee.leaveBalance.od,
      lwp: lwp !== undefined ? lwp : employee.leaveBalance.lwp,
      lhd: lhd !== undefined ? lhd : employee.leaveBalance.lhd,
      others: others !== undefined ? others : employee.leaveBalance.others,
    };

    employee.leaveBalance = updatedLeaveBalance;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Leave balance updated successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Server error while updating leave balance",
    });
  }
};

// Controller to update employee journey
const updateEmployeeJourney = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { payload } = req.body;


    // Find the employee by ID
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .json({ success: false, error: "Employee not found" });
    }

    // Update only if provided
    if (payload.doj !== undefined) employee.doj = payload.doj;
    if (payload.dol !== undefined) employee.dol = payload.dol;

    // Save updated details
    await employee.save();

    return res.json({
      success: true,
      message: "Employee details updated successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      error: "Server error while updating employee details",
    });
  }
};

export {
  addEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
  updateEmployeeLeaveBalance,
  updateEmployeeJourney,
};
