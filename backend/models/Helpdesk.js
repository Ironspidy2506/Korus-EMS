import mongoose from "mongoose";
import { Schema } from "mongoose";

const helpdeskSchema = new mongoose.Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "employee",
    required: true,
  },
  helpId: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  query: {
    type: String,
    required: true,
  },
  response: {
    type: String,
  },
  status: {
    type: Boolean,
    default: false,
  },
});

const Helpdesk = mongoose.model("helpdesk", helpdeskSchema);
export default Helpdesk;
