import * as authService from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }
    const result = await authService.registerUser(name, email, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Please enter email and password");
    }
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400);
      throw new Error("Google token is required");
    }
    const result = await authService.loginWithGoogle(token);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Statless JWT logout can just return success, client deletes token.
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};
