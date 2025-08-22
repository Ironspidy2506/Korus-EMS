import mongoose from "mongoose";
import { Schema } from "mongoose";

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  employeeType: {
    type: String,
    required: true,
  },
  grossSalary: {
    type: Number,
    required: true,
  },
  basicSalary: {
    type: Number,
    required: true,
  },
  payableDays: {
    type: Number,
    required: true,
  },
  allowances: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  deductions: [
    {
      name: { type: String, required: true },
      amount: { type: Number, required: true },
    },
  ],
  paymentMonth: {
    type: String,
    required: true,
  },
  paymentYear: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const Salary = mongoose.model("salary", salarySchema);
export default Salary;
