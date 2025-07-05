import Employee from "../models/Employee.js";
import Message from "../models/Message.js";

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find().populate("employeeId department");
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, error: "Failed to fetch messages" });
  }
};

const addMessage = async (req, res) => {
  try {
    const { employeeId, department, subject, priority, message } = req.body;
    const newMessage = new Message({ employeeId, department, subject, priority, message });
    await newMessage.save();
    res.json({ success: true, message: "Message sent successfully!!" });
  } catch (error) {
    res.json({ success: false, error: "Failed to add message" });
  }
};

const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { subject, priority, message } = req.body;

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { subject, priority, message },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message updated successfully!!" });
  } catch (err) {
    console.error("Update Error:", err);
    res.json({ success: false, message: "Server error" });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const deletedMessage = await Message.findByIdAndDelete(messageId);
    if (!deletedMessage)
      return res.json({ success: false, error: "Message not found" });
    res.json({ success: true, message: "Message deleted successfully!!" });
  } catch (error) {
    res.json({ success: false, error: "Failed to delete message" });
  }
};

const getUsersMessage = async (req, res) => {
  try {
    const { userId } = req.params;

    const employee = await Employee.findOne({ userId });
    const empId = employee._id;

    const messages = await Message.find({ employeeId: empId }).populate(
      "employeeId department"
    );
    res.json({ success: true, messages });
  } catch (error) {
    res.json({ success: false, error: "Failed to fetch user's messages" });
  }
};

const getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId).populate(
      "employeeId department"
    );
    if (!message)
      return res.json({ success: false, error: "Message not found" });
    res.json({ success: true, data: message });
  } catch (error) {
    res.json({ success: false, error: "Failed to fetch message" });
  }
};

const replyMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { reply } = req.body;

    const updated = await Message.findByIdAndUpdate(
      messageId,
      { reply },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Reply saved successfully!!" });
  } catch (err) {
    res.json({ success: false, message: "Server error" });
  }
};

export {
  getAllMessages,
  addMessage,
  editMessage,
  deleteMessage,
  getUsersMessage,
  getMessageById,
  replyMessage,
};
