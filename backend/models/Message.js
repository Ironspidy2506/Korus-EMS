import mongoose from "mongoose";
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "employee",
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: "department",
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    reply: {
      type: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model("message", messageSchema);
export default Message;
