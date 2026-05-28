import API from "./api.js";

export const getHistory = async (page = 1, limit = 10, action = "") => {
  const response = await API.get(`/history?page=${page}&limit=${limit}&action=${action}`);
  return response.data;
};

export const getEntry = async (id) => {
  const response = await API.get(`/history/${id}`);
  return response.data;
};

export const deleteEntry = async (id) => {
  const response = await API.delete(`/history/${id}`);
  return response.data;
};

export const clearHistory = async () => {
  const response = await API.delete("/history");
  return response.data;
};
