import jwt from "jsonwebtoken";

// Evaluate secret lazily inside functions to prevent ES Module import hoisting timing issues
const getSecret = () => {
  return process.env.JWT_SECRET || "supersecretjwtkeyforcodetranslator12345!";
};

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    getSecret(),
    { expiresIn: "7d" }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret());
};
