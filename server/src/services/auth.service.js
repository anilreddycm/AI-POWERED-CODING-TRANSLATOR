import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.utils.js";
import oauth2Client from "../config/google.config.js";

export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  const user = await User.create({
    name,
    email,
    password,
    isGoogleUser: false,
  });

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
    token,
  };
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (user.isGoogleUser) {
    throw new Error("This account is registered via Google. Please log in with Google.");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user);
  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
    },
    token,
  };
};

export const loginWithGoogle = async (googleToken) => {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: googleToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error("Invalid Google token payload");
    }

    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for google
      user = await User.create({
        name,
        email,
        picture,
        isGoogleUser: true,
      });
    } else if (!user.isGoogleUser) {
      // User exists with standard login, link/allow google sign in by setting picture and isGoogleUser if we want, or just log them in
      user.isGoogleUser = true;
      if (picture) user.picture = picture;
      await user.save();
    }

    const token = generateToken(user);
    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      token,
    };
  } catch (error) {
    console.error("Google verify token error:", error);
    throw new Error(`Google authentication failed: ${error.message}`);
  }
};
