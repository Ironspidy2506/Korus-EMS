import mongoose from 'mongoose';
import { Schema } from 'mongoose';

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  }
});

const travelExpenditureSchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: 'employee',
    required: true
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: 'department',
    required: true
  },
  accompaniedTeamMembers: [{
    type: String
  }],
  placeOfVisit: {
    type: String,
    required: true
  },
  clientName: {
    type: String,
    required: true
  },
  projectNo: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true
  },
  purposeOfVisit: {
    type: String,
    required: true
  },
  travelMode: {
    type: String,
    enum: ['Air', 'Rail', 'Other Mode'],
    required: true
  },
  ticketProvidedBy: {
    type: String,
    enum: ['Client', 'KORUS'],
    required: true
  },
  deputationCharges: {
    type: String,
    enum: ['Yes', 'No'],
    required: true
  },
  expenses: [expenseSchema],
  totalAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  voucherNo: {
    type: String
  },
  attachment: {
    fileName: String,
    fileType: String,
    fileData: Buffer
  },
  approvedBy: {
    type: String,
  },
}, {
  timestamps: true
});

// Calculate total amount before saving
travelExpenditureSchema.pre('save', function (next) {
  if (this.expenses && this.expenses.length > 0) {
    this.totalAmount = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }
  next();
});

const TravelExpenditure = mongoose.model('TravelExpenditure', travelExpenditureSchema);
export default TravelExpenditure; 