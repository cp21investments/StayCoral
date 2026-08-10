import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("scc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const getProperties = (category) =>
  api.get("/properties", { params: category ? { category } : {} }).then((r) => r.data);
export const getProperty = (slug) => api.get(`/properties/${slug}`).then((r) => r.data);
export const submitInquiry = (data) => api.post("/inquiries", data).then((r) => r.data);
