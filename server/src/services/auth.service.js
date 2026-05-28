import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.utils.js";
import oauth2Client from "../config/google.config.js";
import { sendOTPEmail } from "./email.service.js";

export const registerUser = async (name, email, password) => {
  const existingUser = await User.findOne({ email });
  
  if (existingUser && existingUser.isVerified) {
    throw new Error("User already exists with this email");
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  let user;
  if (existingUser) {
    // Overwrite the existing unverified user registration details
    existingUser.name = name;
    existingUser.password = password; // pre-save hook will re-hash it
    existingUser.otp = otp;
    existingUser.otpExpiry = otpExpiry;
    user = await existingUser.save();
  } else {
    // Create new pending user
    user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      isGoogleUser: false,
      otp,
      otpExpiry,
    });
  }

  // Send email containing the OTP
  await sendOTPEmail(user.email, otp, user.name);

  return {
    message: "Verification OTP sent to your email",
    email: user.email,
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

  // Block login if not verified
  if (!user.isVerified) {
    // Send a new OTP to help them verify
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOTPEmail(user.email, otp, user.name);

    const error = new Error("Please verify your email before logging in. A new OTP has been sent to your inbox.");
    error.statusCode = 403;
    error.isNotVerified = true;
    throw error;
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

export const verifyOTP = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  if (user.otp !== otp) {
    throw new Error("Invalid verification code");
  }

  if (new Date() > new Date(user.otpExpiry)) {
    throw new Error("Verification code has expired. Please request a new one by signing up or logging in.");
  }

  // Verify user
  user.isVerified = true;
  user.otp = "";
  user.otpExpiry = null;
  await user.save();

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

export const resendOTP = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  if (user.isVerified) {
    throw new Error("Email is already verified");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  await sendOTPEmail(user.email, otp, user.name);

  return {
    message: "Verification OTP resent successfully",
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
      // Create new user for google (automatically verified)
      user = await User.create({
        name,
        email,
        picture,
        isGoogleUser: true,
        isVerified: true,
      });
    } else {
      // Allow link and auto-verify since it is Google OAuth
      let updated = false;
      if (!user.isGoogleUser) {
        user.isGoogleUser = true;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (picture && user.picture !== picture) {
        user.picture = picture;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
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
