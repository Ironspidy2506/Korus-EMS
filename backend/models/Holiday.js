import mongoose from "mongoose";

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Holiday = mongoose.model("holiday", holidaySchema);
export default Holiday;
