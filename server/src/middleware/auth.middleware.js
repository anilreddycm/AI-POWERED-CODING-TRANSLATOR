import User from "../models/User.model.js";
import { verifyToken } from "../utils/jwt.utils.js";

export const protect = async (req, res, next) => {
  let token;

  console.log(`[AUTH DEBUG] Incoming Request to: ${req.method} ${req.originalUrl}`);
  console.log(`[AUTH DEBUG] Authorization Header:`, req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(`[AUTH DEBUG] Token:`, token ? `${token.substring(0, 15)}...` : "none");

      // Decode token
      const decoded = verifyToken(token);
      console.log(`[AUTH DEBUG] Decoded ID:`, decoded.id);

      // Get user from token and exclude password
      req.user = await User.findById(decoded.id).select("-password");
      console.log(`[AUTH DEBUG] Found User:`, req.user ? req.user.email : "null");

      if (!req.user) {
        console.warn(`[AUTH WARNING] User not found for ID: ${decoded.id}`);
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      return next(); // Return to prevent execution continuation
    } catch (error) {
      console.error("[AUTH ERROR] Middleware Error:", error);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    console.warn(`[AUTH WARNING] No token provided in headers`);
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
