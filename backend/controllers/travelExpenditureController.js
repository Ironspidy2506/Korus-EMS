import TravelExpenditure from '../models/TravelExpenditure.js';
import Employee from '../models/Employee.js';
import User from '../models/User.js';

// Get all travel expenditures
export const getAllTravelExpenditures = async (req, res) => {
  try {
    const travelExpenditures = await TravelExpenditure.find()
      .populate('employeeId', 'employeeId name designation department')
      .populate('department', 'departmentName departmentId')
      .sort({ createdAt: -1 });

    res.status(200).json(travelExpenditures);
  } catch (error) {
    console.error('Error fetching travel expenditures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user travel expenditures
export const getUserTravelExpenditures = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });
    const travelExpenditures = await TravelExpenditure.find({ employeeId: employee._id })
      .populate('employeeId')
      .populate('department')
      .sort({ createdAt: -1 });

    res.status(200).json(travelExpenditures);
  } catch (error) {
    console.error('Error fetching user travel expenditures:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add new travel expenditure
export const addTravelExpenditure = async (req, res) => {
  try {
    const {
      employeeId,
      empName,
      designation,
      department,
      departmentCode,
      departmentName,
      accompaniedTeamMembers,
      placeOfVisit,
      clientName,
      projectNo,
      startDate,
      returnDate,
      purposeOfVisit,
      travelMode,
      ticketProvidedBy,
      deputationCharges,
      expenses
    } = req.body;

    // Parse expenses if it's a string
    let parsedExpenses = expenses;
    if (typeof expenses === 'string') {
      parsedExpenses = JSON.parse(expenses);
    }

    // Parse accompaniedTeamMembers if it's a string
    let parsedTeamMembers = accompaniedTeamMembers;
    if (typeof accompaniedTeamMembers === 'string') {
      parsedTeamMembers = JSON.parse(accompaniedTeamMembers);
    }

    // Calculate total amount from expenses
    const totalAmount = parsedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);

    const travelExpenditure = new TravelExpenditure({
      employeeId,
      department,
      accompaniedTeamMembers: parsedTeamMembers || [],
      placeOfVisit,
      clientName,
      projectNo,
      startDate,
      returnDate,
      purposeOfVisit,
      travelMode,
      ticketProvidedBy,
      deputationCharges,
      expenses: parsedExpenses,
      totalAmount,
      attachment: req.file ? {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      } : null
    });

    await travelExpenditure.save();

    const populatedTravelExpenditure = await TravelExpenditure.findById(travelExpenditure._id)
      .populate('employeeId', 'name designation department')
      .populate('department', 'departmentName departmentId');

    res.status(201).json(populatedTravelExpenditure);
  } catch (error) {
    console.error('Error adding travel expenditure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update travel expenditure
export const updateTravelExpenditure = async (req, res) => {
  try {
    const { _id } = req.params;
    const updateData = { ...req.body };

    // Parse expenses if it's a string
    if (updateData.expenses && typeof updateData.expenses === 'string') {
      updateData.expenses = JSON.parse(updateData.expenses);
    }

    // Parse accompaniedTeamMembers if it's a string
    if (updateData.accompaniedTeamMembers && typeof updateData.accompaniedTeamMembers === 'string') {
      updateData.accompaniedTeamMembers = JSON.parse(updateData.accompaniedTeamMembers);
    }

    // Calculate total amount from expenses
    if (updateData.expenses && Array.isArray(updateData.expenses)) {
      updateData.totalAmount = updateData.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    }



    // Handle file attachment
    if (req.file) {
      updateData.attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      };
    }

    const travelExpenditure = await TravelExpenditure.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    ).populate('employeeId', 'name designation department')
      .populate('department', 'departmentName departmentId');

    if (!travelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    res.status(200).json(travelExpenditure);
  } catch (error) {
    console.error('Error updating travel expenditure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete travel expenditure
export const deleteTravelExpenditure = async (req, res) => {
  try {
    const { _id } = req.params;
    const travelExpenditure = await TravelExpenditure.findByIdAndDelete(_id);

    if (!travelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    res.status(200).json({ message: 'Travel expenditure deleted successfully' });
  } catch (error) {
    console.error('Error deleting travel expenditure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Approve or reject travel expenditure
export const approveOrRejectTravelExpenditure = async (req, res) => {
  try {
    const { action, travelExpenditureId } = req.params;
    const { remarks } = req.body;
    const userId = req.user.id;
    const employee = await Employee.findOne({ userId });

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const status = action === 'approve' ? 'approved' : 'rejected';
    const updateData = {
      status,
      approvedBy: employee.name,
      approvedAt: new Date()
    };

    if (remarks) {
      updateData.remarks = remarks;
    }

    const travelExpenditure = await TravelExpenditure.findByIdAndUpdate(
      travelExpenditureId,
      updateData,
      { new: true }
    ).populate('employeeId', 'name designation department')
      .populate('department', 'departmentName departmentId');

    if (!travelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    res.status(200).json(travelExpenditure);
  } catch (error) {
    console.error('Error approving/rejecting travel expenditure:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add voucher number
export const addVoucherNo = async (req, res) => {
  try {
    const { _id } = req.params;
    const { voucherNo } = req.body;

    const travelExpenditure = await TravelExpenditure.findByIdAndUpdate(
      _id,
      { voucherNo },
      { new: true }
    ).populate('employeeId', 'empName designation department');

    if (!travelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    res.status(200).json(travelExpenditure);
  } catch (error) {
    console.error('Error adding voucher number:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get travel expenditure attachment
export const getTravelExpenditureAttachment = async (req, res) => {
  try {
    const { _id } = req.params;
    const travelExpenditure = await TravelExpenditure.findById(_id);

    if (!travelExpenditure || !travelExpenditure.attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.set('Content-Type', travelExpenditure.attachment.fileType);
    res.set('Content-Disposition', `attachment; filename="${travelExpenditure.attachment.fileName}"`);
    res.send(travelExpenditure.attachment.fileData);
  } catch (error) {
    console.error('Error fetching attachment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 