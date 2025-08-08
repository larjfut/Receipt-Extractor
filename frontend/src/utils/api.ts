// utils/api.ts
import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  headers: { "X-Requested-With": "XMLHttpRequest" }
});
export default api;
