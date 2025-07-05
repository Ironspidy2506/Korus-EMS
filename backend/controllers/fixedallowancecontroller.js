import FixedAllowance from "../models/FixedAllowance.js";
import Employee from "../models/Employee.js";

// Route to get all allowances
const getAllFixedAllowance = async (req, res) => {
    try {
        const allowances = await FixedAllowance.find().populate({
            path: "employeeId",
            populate: { path: "department" },
        }).sort({ createdAt: -1 });
        res.json({ success: true, allowances });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server error" });
    }
};

const getUserFixedAllowance = async (req, res) => {
    try {
        const { userId } = req.params;
        const employee = await Employee.findOne({ userId });

        const allowances = await FixedAllowance.find({ employeeId: employee._id }).populate({
            path: "employeeId",
            populate: { path: "department" },
        }).sort({ createdAt: -1 });

        if (allowances.length === 0) {
            return res.json({
                success: true,
                message: "No allowances found!"
            })
        }

        res.json({ success: true, allowances });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Server error" });
    }
};

// Route to add an allowance
const addFixedAllowance = async (req, res) => {
    try {
        const {
            employeeId,
            client,
            projectNo,
            allowanceMonth,
            allowanceYear,
            allowanceType,
            allowanceAmount,
        } = req.body;

        // Check if file was uploaded
        let attachment = null;
        if (req.file) {
            attachment = {
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileData: req.file.buffer,
            };
        }

        // Validate employee existence
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.json({ success: false, message: "Employee not found" });
        }

        // Check if allowance already exists
        const existingAllowance = await FixedAllowance.findOne({
            employeeId,
            client,
            projectNo,
            allowanceMonth,
            allowanceYear,
            allowanceType,
        });

        if (existingAllowance) {
            existingAllowance.allowanceAmount += parseFloat(allowanceAmount);

            // Optionally update attachment if new file is uploaded
            if (attachment) {
                existingAllowance.attachment = attachment;
            }

            await existingAllowance.save();
            return res.json({
                success: true,
                message: "Allowance updated successfully",
                allowance: existingAllowance
            });
        }

        // Create new allowance entry
        const newAllowance = new FixedAllowance({
            employeeId,
            client,
            projectNo,
            allowanceMonth,
            allowanceYear,
            allowanceType,
            allowanceAmount,
            attachment, // Add attachment field
        });

        await newAllowance.save();
        res.json({
            success: true,
            message: "Allowance created successfully",
            allowance: newAllowance
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Server error" });
    }
};

// Route to update an allowance
const updateFixedAllowance = async (req, res) => {
    try {
        const { _id } = req.params;
        const {
            client,
            projectNo,
            allowanceMonth,
            allowanceYear,
            allowanceType,
            allowanceAmount,
        } = req.body;

        // Check for uploaded file
        let attachment = null;
        if (req.file) {
            attachment = {
                fileName: req.file.originalname,
                fileType: req.file.mimetype,
                fileData: req.file.buffer,
            };
        }

        // Build update object
        const updateData = {
            client,
            projectNo,
            allowanceMonth,
            allowanceYear,
            allowanceType,
            allowanceAmount,
        };

        // Include attachment if provided
        if (attachment) {
            updateData.attachment = attachment;
        }

        const allowance = await FixedAllowance.findByIdAndUpdate(
            _id,
            updateData,
            { new: true }
        );

        if (!allowance) {
            return res.json({ success: false, message: "Allowance not found" });
        }

        res.json({
            success: true,
            message: "Allowance updated successfully",
        });

    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Server error" });
    }
};


// Route to delete an allowance
const deleteFixedAllowance = async (req, res) => {
    try {
        const { _id } = req.params;
        const allowance = await FixedAllowance.findByIdAndDelete(_id);
        if (!allowance) {
            return res.json({ success: false, message: "Allowance not found" });
        }
        res.json({ success: true, message: "Allowance deleted successfully" });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Server error" });
    }
};

// Controller to get fixed allowance attachment
const getFixedAllowanceAttachment = async (req, res) => {
    try {
        const { _id } = req.params;
        const allowance = await FixedAllowance.findById(_id);

        if (!allowance || !allowance.attachment) {
            return res.json({ success: false, message: "Attachment not found" });
        }

        res.set("Content-Type", allowance.attachment.fileType);
        res.send(allowance.attachment.fileData);
    } catch (error) {
        console.error("Error fetching attachment:", error);
        res.json({ success: false, message: "Server error" });
    }
};

// Route to update a voucher no
const addVoucherNo = async (req, res) => {
    try {
        const { _id } = req.params;
        const { voucherNo } = req.body;

        const allowance = await FixedAllowance.findByIdAndUpdate(
            _id,
            { voucherNo },
            { new: true }
        );

        if (!allowance) {
            return res.json({ success: false, message: "Allowance not found" });
        }

        res.json({
            success: true,
            message: "Voucher number updated successfully",
        });
    } catch (err) {
        console.error(err);
        res.json({ success: false, message: "Server error" });
    }
};


export {
    getAllFixedAllowance,
    getUserFixedAllowance,
    addFixedAllowance,
    updateFixedAllowance,
    deleteFixedAllowance,
    getFixedAllowanceAttachment,
    addVoucherNo
};
