/**
 * Authentication recovery utilities
 * Helps recover from authentication errors without forcing logout
 */

/**
 * Attempt to refresh the authentication token
 * @returns {Promise<boolean>} - True if refresh was successful
 */
export const attemptTokenRefresh = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      console.log("No refresh token available");
      return false;
    }

    console.log("Attempting to refresh token...");

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1"
      }/auth/refresh`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (!response.ok) {
      console.log("Token refresh failed:", response.status);
      return false;
    }

    const data = await response.json();

    if (data.success && (data.data.accessToken || data.data.token)) {
      const newToken = data.data.accessToken || data.data.token;
      const newRefreshToken = data.data.refreshToken;

      // Update tokens in localStorage
      localStorage.setItem("token", newToken);
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      console.log("Token refreshed successfully");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Token refresh error:", error);
    return false;
  }
};

/**
 * Check if the current token is valid by making a test API call
 * @returns {Promise<boolean>} - True if token is valid
 */
export const validateCurrentToken = async () => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    const response = await fetch(
      `${
        import.meta.env.VITE_API_URL || "http://localhost:5050/api/v1"
      }/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

/**
 * Attempt to recover from authentication error
 * @param {string} errorText - Optional error text to analyze
 * @returns {Promise<'recovered'|'server_restart'|'login_required'>}
 */
export const recoverFromAuthError = async (errorText = "") => {
  console.log("Attempting authentication recovery...");

  // Check if this is a server restart scenario
  if (isServerRestartError(errorText)) {
    console.log("Server restart detected - recovery not possible");
    return "server_restart";
  }

  // First, check if current token is valid
  const isCurrentTokenValid = await validateCurrentToken();

  if (isCurrentTokenValid) {
    console.log("Current token is actually valid");
    return "recovered";
  }

  // Try to refresh the token
  const refreshSuccess = await attemptTokenRefresh();

  if (refreshSuccess) {
    // Verify the new token works
    const isNewTokenValid = await validateCurrentToken();

    if (isNewTokenValid) {
      console.log("Token refresh successful");
      return "recovered";
    }
  }

  console.log("Authentication recovery failed");
  return "login_required";
};

/**
 * Clear authentication data and redirect to login
 * @param {string} message - Optional message to show on login page
 */
export const clearAuthAndRedirect = (message = "") => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  const url = message
    ? `/login?message=${encodeURIComponent(message)}`
    : "/login";
  window.location.href = url;
};

/**
 * Check if error indicates a server restart scenario
 * @param {string} error - Error message or response text
 * @returns {boolean} - True if it's likely a server restart
 */
export const isServerRestartError = (error) => {
  const serverRestartIndicators = [
    "Invalid token",
    "jwt malformed",
    "invalid signature",
    "JsonWebTokenError",
    "TokenExpiredError",
  ];

  return serverRestartIndicators.some((indicator) =>
    error.toLowerCase().includes(indicator.toLowerCase())
  );
};

/**
 * Handle server restart scenario by clearing tokens and redirecting
 */
export const handleServerRestart = () => {
  // Clear all authentication data
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Redirect to login with a message
  const message = encodeURIComponent(
    "Your session has expired due to a server restart. Please log in again."
  );
  window.location.href = `/login?message=${message}`;
};

/**
 * Show user-friendly authentication error message
 * @param {string} error - Error message
 * @returns {string} - User-friendly message
 */
export const getAuthErrorMessage = (error) => {
  if (isServerRestartError(error)) {
    return "Your session has expired due to a server restart. Please log in again.";
  }

  if (error.includes("403") || error.includes("Invalid token")) {
    return "Your session has expired or is invalid. Please log in again.";
  }

  if (error.includes("401") || error.includes("Unauthorized")) {
    return "Authentication required. Please log in to continue.";
  }

  if (error.includes("Network") || error.includes("fetch")) {
    return "Network error. Please check your connection and try again.";
  }

  return "Authentication error occurred. Please try again.";
};
