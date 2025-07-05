import Holiday from "../models/Holiday.js";

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find();
    return res.json({ success: true, holidays });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const addHoliday = async (req, res) => {
  try {
    const { name, date, type, description, isRecurring } = req.body;

    const newHoliday = new Holiday({
      name,
      date,
      type,
      description,
      isRecurring,
    });

    await newHoliday.save();

    return res.json({
      success: true,
      message: "Holiday Added Successfully!",
      holiday: newHoliday,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const editHoliday = async (req, res) => {
  try {
    const { name, date, type, description, isRecurring } = req.body;
    const { _id } = req.params;

    const updated = await Holiday.findByIdAndUpdate(
      _id,
      { name, date, type, description, isRecurring },
      { new: true }
    );

    if (!updated) {
      return res.json({ success: false, message: "Holiday not found!" });
    }

    return res.json({
      success: true,
      message: "Holiday Updated Successfully!",
      holiday: updated,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { _id } = req.params;

    const deleted = await Holiday.findByIdAndDelete(_id);

    if (!deleted) {
      return res.json({ success: false, message: "Holiday not found!" });
    }

    return res.json({
      success: true,
      message: "Holiday Deleted Successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

export { getHolidays, addHoliday, editHoliday, deleteHoliday };
