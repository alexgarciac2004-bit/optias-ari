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

// En celular abre la app de WhatsApp, en desktop abre WhatsApp Web.
const isMobile = () =>
  /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export const waLink = (text = "") => {
  const encoded = encodeURIComponent(text);
  if (isMobile()) {
    return `https://wa.me/52${WHATSAPP_NUMBER}?text=${encoded}`;
  }
  return `https://web.whatsapp.com/send?phone=52${WHATSAPP_NUMBER}&text=${encoded}`;
};
