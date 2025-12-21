import Notification from "../models/Notification.js";

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json({ success: true, notifications });
  } catch (error) {
    res.json({ success: false, error: "Failed to fetch notifications" });
  }
};

export { getAllNotifications };

