/**
 * AuthContext.jsx — Global authentication state for the RepoSpec frontend.
 *
 * What it stores:
 *   user  : { id, username, githubUsername } | null
 *   token : JWT string | null
 *
 * Persistence:
 *   Both token and user are mirrored in localStorage so that a page refresh
 *   restores the session without a round-trip to the backend.
 *
 * Login flows:
 *   1. Email/password: Login.jsx calls login() → POST /api/v3/auth/login
 *   2. GitHub OAuth:   OAuthSuccessHandler redirects to /login-success with
 *      query params; LoginSuccess.jsx calls loginWithToken() directly.
 *   3. Registration:   Register.jsx calls register() → POST /api/v3/auth/register
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUserApi, registerUser } from "../utils/axios/userApi";

const AuthContext = createContext(null);

/**
 * AuthProvider — wraps the entire app (in App.jsx) to make auth state
 * available to any descendant via useAuth().
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true); // true during hydration from localStorage

  /**
   * On mount: hydrate state from localStorage.
   * This runs once and restores the session if the user previously logged in.
   */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser  = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false); // signal that auth check is complete (ProtectedRoute uses this)
  }, []);

  /**
   * Authenticates with username/password via the REST API.
   * On success, stores token + user in both state and localStorage.
   *
   * @param {{ username: string, password: string }} credentials
   * @returns {{ id, username, githubUsername }} the stored user info
   * @throws Axios error on invalid credentials (handled by Login.jsx)
   */
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await loginUserApi(credentials);
      setToken(data.token);
      const userInfo = { id: data.id, username: data.username, githubUsername: data.githubUsername };
      setUser(userInfo);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userInfo));
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registers a new account and immediately logs the user in.
   * Same behaviour as login() — sets token + user everywhere.
   *
   * @param {{ username: string, password: string }} payload
   * @returns {{ id, username, githubUsername }}
   */
  const register = async (payload) => {
    setLoading(true);
    try {
      const data = await registerUser(payload);
      setToken(data.token);
      const userInfo = { id: data.id, username: data.username, githubUsername: data.githubUsername };
      setUser(userInfo);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userInfo));
      return userInfo;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clears all auth state and removes localStorage entries.
   * Called by NavBar's Logout button.
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  /**
   * Called by LoginSuccess.jsx after a GitHub OAuth redirect.
   * The backend sends token + user info as URL query params;
   * LoginSuccess extracts them and calls this to hydrate state.
   *
   * @param {{ token: string, id: number|string, username: string, githubUsername: string }} params
   */
  const loginWithToken = ({ token, id, username, githubUsername }) => {
    const userInfo = { id, username, githubUsername };
    setToken(token);
    setUser(userInfo);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userInfo));
  };

  /**
   * Patches the githubUsername in the stored user object without a full re-login.
   * Used after a user successfully links their GitHub account post-registration.
   *
   * @param {string} githubUsername
   */
  const updateGithubUsername = (githubUsername) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, githubUsername };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, register, logout, loading, updateGithubUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth — convenience hook.
 * Must be used inside an <AuthProvider> (throws if not).
 *
 * @returns {{ user, token, login, loginWithToken, register, logout, loading, updateGithubUsername }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

