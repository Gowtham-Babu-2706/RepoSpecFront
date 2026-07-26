/**
 * api.js — Preconfigured Axios instance for all backend requests.
 *
 * Base URL : http://localhost:8081/api/v3/
 * Timeout  : 20 seconds
 *
 * Interceptors:
 *  Request  — Automatically attaches the JWT from localStorage as a Bearer token.
 *  Response — On 401/403, clears auth state and redirects to /login (unless already there).
 */
import axios from "axios";

const api = axios.create({
    baseURL: "https://repospec.freedynamicdns.net/api/v3/",
    timeout: 20000,
    headers: {
        "Content-Type": "application/json",
    }
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Runs before every request: reads the JWT stored by AuthContext and injects it.
// This means all API functions in userApi.js are automatically authenticated.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Runs after every response: handles session expiration.
// 401 = token missing / invalid  |  403 = token valid but access denied
// In both cases we clear storage and redirect to login to force re-authentication.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            // Only redirect if we're not on public pages or hitting public endpoints
            const path = window.location.pathname;
            const requestUrl = error.config?.url || "";
            const isPublicRoute = path === "/" || path === "/login" || path === "/register" || path === "/search";
            const isPublicEndpoint = requestUrl.includes("repo/public") || requestUrl.includes("auth/");

            if (!isPublicRoute && !isPublicEndpoint) {
                window.location.href = "/login?error=session_expired";
            }
        }
        return Promise.reject(error);
    }
);

export default api;