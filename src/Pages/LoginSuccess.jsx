import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginSuccess = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    // Parse query params sent by OAuthSuccessHandler.java
    const params       = new URLSearchParams(window.location.search);
    const token        = params.get("token");
    const id           = params.get("id");
    const username     = params.get("username");
    const githubUsername = params.get("githubUsername");

    if (!token || !username) {
      setError("GitHub login failed — missing token or user info. Please try again.");
      return;
    }

    try {
      // Hydrate AuthContext + localStorage with the OAuth session data
      // id is a UUID string from the backend (User#id is GenerationType.UUID)
      loginWithToken({ token, id, username, githubUsername });
      navigate("/", { replace: true }); // replace so back button doesn't return here
    } catch {
      setError("Failed to store session. Please try again.");
    }
  }, [navigate, loginWithToken]);


  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white px-4">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <a
            href="/login"
            className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition font-medium"
          >
            Back to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Signing you in with GitHub…</p>
      </div>
    </div>
  );
};

export default LoginSuccess;
