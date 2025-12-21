import mongoose from "mongoose";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['normal', 'high', 'urgent'],
      default: 'normal',
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("notification", notificationSchema);
export default Notification;

