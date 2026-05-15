import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("optica_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const WHATSAPP_NUMBER = "9999022780";

// Build a WhatsApp link that AVOIDS api.whatsapp.com (some networks/firewalls block it).
// Uses web.whatsapp.com which works on desktop, and on mobile redirects to the app.
export const waLink = (text = "") =>
  `https://web.whatsapp.com/send?phone=52${WHATSAPP_NUMBER}&text=${encodeURIComponent(text)}`;
