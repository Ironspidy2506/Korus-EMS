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
      placeOfVisit,
      clientName,
      projectNo,
      startDate,
      returnDate,
      purposeOfVisit,
      travelMode,
      ticketProvidedBy,
      deputationCharges,
      expenses,
      dayCharges,
      claimedFromClient
    } = req.body;

    // Parse expenses if it's a string
    let parsedExpenses = expenses;
    if (typeof expenses === 'string') {
      parsedExpenses = JSON.parse(expenses);
    }

    // Parse day charges if it's a string
    let parsedDayCharges = dayCharges;
    if (typeof dayCharges === 'string') {
      parsedDayCharges = JSON.parse(dayCharges);
    }

    // Calculate total amount from expenses and day charges
    let totalAmount = 0;
    if (parsedExpenses && parsedExpenses.length > 0) {
      totalAmount += parsedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    }
    if (parsedDayCharges && parsedDayCharges.length > 0) {
      totalAmount += parsedDayCharges.reduce((sum, charge) => sum + (charge.amount || 0), 0);
    }

    const travelExpenditure = new TravelExpenditure({
      employeeId,
      department,
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
      dayCharges: parsedDayCharges,
      totalAmount,
      claimedFromClient: claimedFromClient === true || claimedFromClient === 'true',
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

    // Parse day charges if it's a string
    if (updateData.dayCharges && typeof updateData.dayCharges === 'string') {
      updateData.dayCharges = JSON.parse(updateData.dayCharges);
    }

    // Normalize claimedFromClient to boolean when present
    if (typeof updateData.claimedFromClient !== 'undefined') {
      updateData.claimedFromClient = updateData.claimedFromClient === true || updateData.claimedFromClient === 'true';
    }

    // Handle file attachment
    if (req.file) {
      updateData.attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      };
    }

    // First, find the existing document
    const existingTravelExpenditure = await TravelExpenditure.findById(_id);
    if (!existingTravelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    // Explicitly set the fields instead of using Object.assign for arrays
    if (updateData.expenses !== undefined) {
      existingTravelExpenditure.expenses = updateData.expenses;
    }
    if (updateData.dayCharges !== undefined) {
      existingTravelExpenditure.dayCharges = updateData.dayCharges;
    }

    // Set other fields
    if (updateData.placeOfVisit !== undefined) {
      existingTravelExpenditure.placeOfVisit = updateData.placeOfVisit;
    }
    if (updateData.clientName !== undefined) {
      existingTravelExpenditure.clientName = updateData.clientName;
    }
    if (updateData.projectNo !== undefined) {
      existingTravelExpenditure.projectNo = updateData.projectNo;
    }
    if (updateData.startDate !== undefined) {
      existingTravelExpenditure.startDate = updateData.startDate;
    }
    if (updateData.returnDate !== undefined) {
      existingTravelExpenditure.returnDate = updateData.returnDate;
    }
    if (updateData.purposeOfVisit !== undefined) {
      existingTravelExpenditure.purposeOfVisit = updateData.purposeOfVisit;
    }
    if (updateData.travelMode !== undefined) {
      existingTravelExpenditure.travelMode = updateData.travelMode;
    }
    if (updateData.ticketProvidedBy !== undefined) {
      existingTravelExpenditure.ticketProvidedBy = updateData.ticketProvidedBy;
    }
    if (updateData.deputationCharges !== undefined) {
      existingTravelExpenditure.deputationCharges = updateData.deputationCharges;
    }
    if (updateData.claimedFromClient !== undefined) {
      existingTravelExpenditure.claimedFromClient = updateData.claimedFromClient;
    }

    // Only update attachment if a new file is uploaded
    if (req.file) {
      existingTravelExpenditure.attachment = {
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileData: req.file.buffer
      };
    }
    // Don't update attachment if no new file is uploaded (keep existing one)

    // Save the document to trigger the pre-save middleware for totalAmount calculation
    await existingTravelExpenditure.save();

    // Fetch the updated document with populated fields
    const updatedTravelExpenditure = await TravelExpenditure.findById(_id)
      .populate('employeeId', 'name designation department')
      .populate('department', 'departmentName departmentId');

    res.status(200).json(updatedTravelExpenditure);
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

// Update voucher number
export const updateVoucherNo = async (req, res) => {
  try {
    const { _id } = req.params;
    const { voucherNo } = req.body;

    const travelExpenditure = await TravelExpenditure.findByIdAndUpdate(
      _id,
      { voucherNo },
      { new: true }
    ).populate('employeeId', 'name designation department')
      .populate('department', 'departmentName departmentId');

    if (!travelExpenditure) {
      return res.status(404).json({ message: 'Travel expenditure not found' });
    }

    res.status(200).json(travelExpenditure);
  } catch (error) {
    console.error('Error updating voucher number:', error);
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

// View travel expenditure attachment inline in browser
export const viewTravelExpenditureAttachment = async (req, res) => {
  try {
    const { _id } = req.params;
    const travelExpenditure = await TravelExpenditure.findById(_id);

    if (!travelExpenditure || !travelExpenditure.attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    res.set('Content-Type', travelExpenditure.attachment.fileType);
    res.set('Content-Disposition', `inline; filename="${travelExpenditure.attachment.fileName}"`);
    res.send(travelExpenditure.attachment.fileData);
  } catch (error) {
    console.error('Error viewing attachment inline:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};