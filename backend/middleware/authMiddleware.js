import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Authorization header missing or malformed",
        });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid or expired token" });
    }

    const user = await User.findById(decoded._id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    req.user = user; // Attach user to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export default verifyUser;
