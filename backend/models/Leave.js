import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ["el", "sl", "cl", "od", "lwp", , "lhd", "others"],
    required: true,
  },
  days: {
    type: Number,
    required: true,
    min: 0.5,
  },
  status: {
    type: String,
    default: "pending",
  },
  appliedTo: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "employee",
    },
  ],
  attachment: {
    fileName: String,
    fileType: String,
    fileData: Buffer,
  },
  approvedBy: {
    type: String,
  },
  rejectedBy: {
    type: String,
  },
  ror: {
    type: String,
  },
}, {
  timestamps: true
});

const Leave = mongoose.model("Leave", leaveSchema);
export default Leave;
