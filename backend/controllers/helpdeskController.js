import Employee from "../models/Employee.js";
import Helpdesk from "../models/Helpdesk.js";

// Controller to get all helps
const getAllHelps = async (req, res) => {
  try {
    const helps = await Helpdesk.find()
      .populate("employeeId")
      .sort({ date: -1 });

    return res.json({
      success: true,
      helps,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to apply for a help
const applyHelp = async (req, res) => {
  try {
    const { employeeId, query } = req.body;
    function generateRandomCode() {
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      return "H" + randomDigits;
    }

    if (!query) {
      return res.json({ success: false, message: "Write your query!" });
    }

    const employee = await Employee.findOne({ userId: employeeId });

    const help = new Helpdesk({
      employeeId: employee._id,
      helpId: generateRandomCode(),
      query,
    });

    await help.save();

    return res.json({
      success: true,
      message: "Query Submitted Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to update a help
const updateHelp = async (req, res) => {
  try {
    const { _id } = req.params;
    const { query } = req.body;
    await Helpdesk.findByIdAndUpdate(_id, { query });
    return res.json({
      success: true,
      message: "Query Updated Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to delete a help
const deleteHelp = async (req, res) => {
  try {
    const { _id } = req.params;
    await Helpdesk.findByIdAndDelete(_id);
    return res.json({
      success: true,
      message: "Query Deleted Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const resolveHelp = async (req, res) => {
  try {
    const { _id } = req.params;
    await Helpdesk.findByIdAndUpdate(_id, { status: true });
    return res.json({
      success: true,
      message: "Query Resolved Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const addResponse = async (req, res) => {
  try {
    const { helpId } = req.params;
    const { response } = req.body;

    await Helpdesk.findByIdAndUpdate(helpId, { response, status: true });
    return res.json({
      success: true,
      message: "Response Updated Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const getUserHelps = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });
    const helps = await Helpdesk.find({ employeeId: employee._id });
    return res.json({ success: true, helps });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};


export {
  applyHelp,
  getUserHelps,
  updateHelp,
  getAllHelps,
  resolveHelp,
  deleteHelp,
  addResponse,
};
