import Ltc from '../models/Ltc.js';
import Employee from '../models/Employee.js';

export const getAllLTCs = async (req, res) => {
  try {
    const ltcs = await Ltc.find()
      .populate('employeeId', 'name employeeId designation')
      .populate('department', 'departmentName departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json(ltcs);
  } catch (error) {
    console.error('Error fetching LTCs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserLTCs = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const ltcs = await Ltc.find({ employeeId })
      .populate('employeeId', 'name employeeId designation')
      .populate('department', 'departmentName departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json(ltcs);
  } catch (error) {
    console.error('Error fetching user LTCs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addLTC = async (req, res) => {
  try {
    const {
      employeeId,
      department,
      serviceCompletionFrom,
      serviceCompletionTo,
      leavePeriodFrom,
      leavePeriodTo,
      reimbursementAmount
    } = req.body;

    // Validate required fields
    if (!employeeId || !department || !serviceCompletionFrom || !serviceCompletionTo ||
      !leavePeriodFrom || !leavePeriodTo || !reimbursementAmount) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Handle attachment if provided
    let attachment = null;
    if (req.file) {
      attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      };
    }

    const ltc = new Ltc({
      employeeId,
      department,
      serviceCompletionFrom,
      serviceCompletionTo,
      leavePeriodFrom,
      leavePeriodTo,
      reimbursementAmount: parseFloat(reimbursementAmount),
      attachment
    });

    const savedLTC = await ltc.save();

    // Populate the saved LTC with employee and department details
    const populatedLTC = await Ltc.findById(savedLTC._id)
      .populate('employeeId', 'name employeeId designation')
      .populate('department', 'departmentName departmentId');

    res.status(201).json(populatedLTC);
  } catch (error) {
    console.error('Error adding LTC:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateLTC = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Handle attachment if provided
    if (req.file) {
      updateData.attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      };
    }

    // Convert string values to numbers where needed
    if (updateData.reimbursementAmount) {
      updateData.reimbursementAmount = parseFloat(updateData.reimbursementAmount);
    }

    const ltc = await Ltc.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('employeeId', 'name employeeId designation')
      .populate('department', 'departmentName departmentId');

    if (!ltc) {
      return res.status(404).json({ message: 'LTC not found' });
    }

    res.status(200).json(ltc);
  } catch (error) {
    console.error('Error updating LTC:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteLTC = async (req, res) => {
  try {
    const { id } = req.params;
    const ltc = await Ltc.findByIdAndDelete(id);

    if (!ltc) {
      return res.status(404).json({ message: 'LTC not found' });
    }

    res.status(200).json({ message: 'LTC deleted successfully' });
  } catch (error) {
    console.error('Error deleting LTC:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const approveOrRejectLTC = async (req, res) => {
  try {
    const { id } = req.params;
    const action = req.path.includes('approve') ? 'approve' : 'reject';

    const updateData = {
      status: action === 'approve' ? 'approved' : 'rejected',
    };

    const ltc = await Ltc.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('employeeId', 'name employeeId designation')
      .populate('department', 'departmentName departmentId');

    if (!ltc) {
      return res.status(404).json({ message: 'LTC not found' });
    }

    res.status(200).json(ltc);
  } catch (error) {
    console.error('Error approving/rejecting LTC:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 