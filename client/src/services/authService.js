import API from "./api.js";

export const register = async (name, email, password) => {
  const response = await API.post("/auth/register", { name, email, password });
  return response.data;
};

export const emailLogin = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const googleLogin = async (token) => {
  const response = await API.post("/auth/google", { token });
  return response.data;
};

export const logout = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};
