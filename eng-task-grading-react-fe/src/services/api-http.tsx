import axios from "axios";

export const apiHttp = axios.create({
  baseURL: "https://example.com/api", // změň podle svého backendu
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});