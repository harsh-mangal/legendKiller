import axios from "axios";
import { clearAdminSession, getAdminToken } from "../utils/storage";

const configured = String(import.meta.env.VITE_API_BASE_URL || "").trim();
const defaultApiBaseUrl = "https://api.legendbornnutrition.com/api";

export const API_BASE_URL = (configured || defaultApiBaseUrl).replace(/\/$/, "");
export const BASE_URL = API_BASE_URL.replace(/\/api(?:\/v\d+)?$/i, "");
const storefrontConfigured = String(import.meta.env.VITE_STOREFRONT_URL || "").trim();
export const STOREFRONT_URL = (storefrontConfigured || "https://legendbornnutrition.com").replace(/\/$/, "");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: Math.max(5000, Number(import.meta.env.VITE_API_TIMEOUT_MS || 20000)),
  headers: { Accept: "application/json" },
});

API.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAdminSession();
      if (window.location.pathname !== "/login") {
        const next = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?next=${encodeURIComponent(next)}`);
      }
    }
    if (error.response?.status === 413) {
      error.message = "The uploaded media is too large for the server (413 Request Entity Too Large). Please compress your video or set Nginx 'client_max_body_size 250M;'.";
    } else if (error.code === "ECONNABORTED") {
      error.message = "The upload took too long to complete. Please try again or check network speed.";
    } else if (!error.response) {
      error.message = "Unable to reach the API server. Check the API URL and backend status.";
    }
    return Promise.reject(error);
  }
);

export const assetUrl = (value) => {
  if (!value) return "";
  const url = String(value);
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default API;
