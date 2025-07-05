import mongoose from "mongoose";
import { Schema } from "mongoose";

const fixedallowanceSchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  client: {
    type: String,
    default: ""
  },
  projectNo: {
    type: String,
    default: ""
  },
  allowanceMonth: {
    type: String,
    required: true,
  },
  allowanceYear: {
    type: String,
    required: true,
  },
  allowanceType: {
    type: String,
    required: true,
  },
  attachment: {
    fileName: String,
    fileType: String,
    fileData: Buffer,
  },
  allowanceAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: "approved",
  },
  voucherNo: {
    type: String,
    default: "",
  },
  addedBy: {
    type: String,
  }
}, {
  timestamps: true,
});

const FixedAllowance = mongoose.model("fixed-allowance", fixedallowanceSchema);
export default FixedAllowance;
