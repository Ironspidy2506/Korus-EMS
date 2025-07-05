import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import transporter from "../config/nodemailer.js";

// Controller to get all leaves
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate({
        path: "employeeId",
        populate: {
          path: "department",
          model: "department",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, leaves });
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.json({ success: false, message: "An error occurred while fetching leaves" });
  }
};

// Controller to get user leaves
const getLeaveHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.json({ success: false, message: "Employee not found" });
    }

    const leaves = await Leave.find({ employeeId: employee._id })
      .populate({
        path: "employeeId",
      })
      .sort({ lastUpdated: -1 });

    if (leaves.length === 0) {
      return res.json({
        success: false,
        message: "No leave records found!"
      });
    }

    res.json({
      success: true,
      message: "User Leave History Fetched Successfully!",
      leaves
    });
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.json({ success: false, error: "Failed to fetch leave history" });
  }
};

// Controller to get user leave for approvals
const getUserLeaveForApprovals = async (req, res) => {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({ userId });
    const empId = employee._id;

    const leaves = await Leave.find({ appliedTo: { $in: [empId] } })
      .populate({
        path: "employeeId",
        populate: {
          path: "department",
          model: "department",
        },
      })
      .populate("appliedTo")
      .sort({ lastUpdated: -1 });

    if (leaves.length === 0) {
      return res.json({
        success: false,
        message: "No leaves found for approval"
      });
    }

    res.json({ success: true, messages: "Leaves Fetched Successfully!", leaves });
  } catch (error) {
    console.error("Error fetching leaves for approval:", error);
    res.json({ success: false, message: "Failed to fetch leaves for approval." });
  }
};

// Controller to apply for a leave
const applyForLeave = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, startTime, endDate, endTime, reason, type, days } =
      req.body;

    let appliedTo = [];
    try {
      appliedTo = JSON.parse(req.body.appliedTo || "[]");
      if (!Array.isArray(appliedTo) || appliedTo.length === 0) {
        return res.json({ success: false, message: "Invalid 'appliedTo' data" });
      }
    } catch (error) {
      return res.json({ success: false, message: "Invalid 'appliedTo' format" });
    }

    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.json({ success: false, error: "Employee not found" });
    }

    const typeLower = type.toLowerCase();

    if (!["od", "others", "lwp", "lhd"].includes(typeLower)) {
      const leaveBalance = employee.leaveBalance[typeLower];
      if (leaveBalance < days) {
        return res.json({ success: false, message: "Not enough leave balance" });
      }
    }

    const approvers = await Employee.find({ _id: { $in: appliedTo } });
    if (approvers.length !== appliedTo.length) {
      return res.json({ success: false, message: "One or more approvers not found" });
    }

    let attachment = null;
    if (req.file) {
      attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer,
      };
    }

    const newLeave = new Leave({
      employeeId: employee._id,
      startDate,
      startTime,
      endDate,
      endTime,
      reason,
      type: typeLower,
      days,
      appliedTo,
      attachment,
    });

    await newLeave.save();

    const approverEmails = approvers
      .map((approver) => approver.email)
      .join(",");

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: approverEmails,
      subject: "New Leave Application",
      html: `
        <p>Dear Approver,</p>
        <p><strong>${employee.name}</strong> has applied for leave from <strong>${startDate}</strong> to <strong>${endDate}</strong>.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please review the request.</p>
        <br>
        <p>Best Regards,<br><strong>Korus Engineering Solutions Pvt. Ltd.</strong></p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "Leave applied successfully", leave: newLeave });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.json({ success: false, message: "Server error" });
  }
};

// Controller to update a leave
const updateLeaveById = async (req, res) => {
  try {
    const { _id } = req.params;

    const appliedTo = JSON.parse(req.body.appliedTo || "[]");

    const { startDate, startTime, endDate, endTime, reason, type, days } =
      req.body;

    const leaveHistory = await Leave.findById(_id);
    if (!leaveHistory) {
      return res.json({ success: false, error: "Leave record not found" });
    }

    const employee = await Employee.findById(leaveHistory.employeeId);
    if (!employee) {
      return res.json({ success: false, error: "Employee not found" });
    }

    const typeLower = type.toLowerCase();

    if (!["od", "others", "lwp", "lhd"].includes(typeLower)) {
      const leaveBalance = employee.leaveBalance[typeLower];
      if (leaveBalance < days) {
        return res.json({ success: false, message: "Not enough leave balance" });
      }
    }

    const approvers = await Employee.find({ _id: { $in: appliedTo } });
    if (approvers.length !== appliedTo.length) {
      return res.json({ success: false, message: "One or more approvers not found" });
    }
    leaveHistory.appliedTo = appliedTo;

    if (req.file) {
      leaveHistory.attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer,
      };
    }

    leaveHistory.type = typeLower;
    leaveHistory.startDate = startDate;
    leaveHistory.startTime = startTime;
    leaveHistory.endDate = endDate;
    leaveHistory.endTime = endTime;
    leaveHistory.days = days;
    leaveHistory.reason = reason;

    const updatedLeave = await leaveHistory.save();
    res.json({ success: true, message: "Leave updated successfully", leave: updatedLeave });
  } catch (error) {
    console.error("Error updating leave record:", error);
    res.json({ success: false, error: "Failed to update leave record" });
  }
};

// Controller to delete a leave
const deleteLeaveById = async (req, res) => {
  try {
    const { _id } = req.params;
    const leave = await Leave.findById(_id);

    if (!leave) {
      return res.json({
        success: false,
        message: "Leave record not found",
      });
    }

    await Leave.findByIdAndDelete(_id);

    res.json({
      success: true,
      message: "Leave record deleted successfully and leave balance updated",
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.json({
      success: false,
      message: "Error deleting leave record",
    });
  }
};

// Controller to approve or reject a leave
const approveOrReject = async (req, res) => {
  try {
    const user = req.user;
    const { leaveId, action } = req.params;

    if (!["approved", "rejected"].includes(action)) {
      return res.json({
        success: false,
        message: "Invalid action. Must be 'approved' or 'rejected'.",
      });
    }

    const leave = await Leave.findById(leaveId).populate("employeeId");
    if (!leave) {
      return res.json({ success: false, message: "Leave request not found." });
    }

    const employee = leave.employeeId;
    const type = leave.type.toLowerCase();

    if (action === "approved") {
      if (["od", "lwp", "others", "lhd"].includes(type)) {
        employee.leaveBalance[type] += leave.days;
      } else {
        if (employee.leaveBalance[type] < leave.days) {
          return res.json({ success: false, message: "Insufficient leave balance." });
        }
        employee.leaveBalance[type] -= leave.days;
      }

      leave.status = "approved";
      leave.approvedBy = user.name;

      await employee.save();
    } else if (action === "rejected") {
      if (leave.status === "approved") {
        if (["od", "lwp", "others", "lhd"].includes(type)) {
          employee.leaveBalance[type] -= leave.days;
        } else {
          employee.leaveBalance[type] += leave.days;
        }

        leave.rejectedBy = user.name;
      } else {
        leave.rejectedBy = user.name;
      }

      leave.status = "rejected";
      await employee.save();
    }

    await leave.save();

    res.json({ success: true, message: `Leave successfully ${action}d.`, leave });
  } catch (error) {
    console.error(`Error while ${action}ing leave:`, error);
    res.json({ success: false, error: "Internal server error." });
  }
};

// Controller to get leave attachment
const getLeaveAttachment = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findById(leaveId);

    if (!leave || !leave.attachment) {
      return res.json({ success: false, message: "Attachment not found" });
    }

    res.set("Content-Type", leave.attachment.fileType);
    res.send(leave.attachment.fileData);
  } catch (error) {
    console.error("Error fetching attachment:", error);
    res.json({ success: false, message: "Server error" });
  }
};

// Controller to update the reason of rejection
const updateReasonOfRejection = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const { response } = req.body;
    
    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.json({ success: false, message: "Leave not found" });
    }

    leave.ror = response;
    await leave.save();

    res.json({
      success: true,
      message: "Reason of rejection updated successfully",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  getAllLeaves,
  getLeaveHistory,
  getUserLeaveForApprovals,
  applyForLeave,
  updateLeaveById,
  deleteLeaveById,
  approveOrReject,
  getLeaveAttachment,
  updateReasonOfRejection
};
