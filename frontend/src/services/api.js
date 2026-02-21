import axios from "axios";
import { storage } from "@/utils/storage";
import { isTokenExpired } from "@/utils/tokenUtils";
import { appConfig } from "@/config/appConfig";
import { createDemoAdapter } from "@/services/demo/demoAdapter";

export const API_URL = appConfig.apiUrl;

console.log("API Configuration:", {
  NODE_ENV: import.meta.env.NODE_ENV,
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_DEMO_MODE: import.meta.env.VITE_DEMO_MODE,
  API_URL: API_URL,
});

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

if (appConfig.demoMode) {
  console.info("🛰️ Cloudspace running in DEMO MODE – all requests served locally");
  const demoAdapter = createDemoAdapter();
  api.defaults.adapter = demoAdapter;
  axios.defaults.adapter = demoAdapter; // Catch raw axios calls too

  // Mock window.fetch to use axios in demo mode
  // This ensures components using raw fetch still use our demo data
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    try {
      // Convert fetch options to axios config
      const axiosConfig = {
        url: url.toString(),
        method: options.method || 'GET',
        headers: options.headers || {},
        data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined,
        params: options.params,
      };

      // Ensure Authorization header is present if we have a token
      const token = storage.getItem("token");
      if (token && !axiosConfig.headers.Authorization) {
        axiosConfig.headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios(axiosConfig);

      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        json: async () => response.data,
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        blob: async () => new Blob([response.data]),
        headers: {
          get: (name) => response.headers[name.toLowerCase()],
        }
      };
    } catch (error) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          statusText: error.response.statusText,
          json: async () => error.response.data,
        };
      }
      throw error;
    }
  };
}

api.interceptors.request.use(
  async (config) => {
    if (config.url?.includes("/auth/register") && config.data) {
      const company_id = localStorage.getItem("company_id");
      if (company_id) {
        config.data.company_id = company_id;
      }
      return config;
    }

    if (
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register")
    ) {
      return config;
    }

    const token = storage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        if (appConfig.demoMode) {
          return config;
        }

        const refreshToken = storage.getItem("refreshToken");
        if (refreshToken && !isTokenExpired(refreshToken)) {
          try {
            const response = await api.post("/auth/refresh", { refreshToken });
            const newToken = response.data.token || response.data.accessToken;

            if (newToken) {
              storage.setItem("token", newToken);
              config.headers.Authorization = `Bearer ${newToken}`;
            }
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        } else {
          return config;
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    const userStr = storage.getItem("user");
    if (userStr) {
      try {
        let user;
        if (typeof userStr === 'string' && userStr.startsWith('{')) {
          user = JSON.parse(userStr);
        } else if (typeof userStr === 'object') {
          user = userStr;
        } else {
          throw new Error('User data is not a valid JSON string');
        }
        const companyId = user?.Companies?.[0]?.id || user?.company_id;

        if (companyId) {
          config.headers['X-Company-Id'] = companyId;

          if (config.method === 'get' && !config.params?.company_id) {
            config.params = { ...config.params, company_id: companyId };
          }

          if (['post', 'put', 'patch'].includes(config.method) && config.data) {
            if (!(config.data instanceof FormData) && typeof config.data === 'object' && !config.data.company_id) {
              config.data = { ...config.data, company_id: companyId };
            }
          }
        }
      } catch (e) {
        console.warn('Failed to parse user data for company_id:', e);
      }
    }

    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (appConfig.demoMode) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/register") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = storage.getItem("refreshToken");
      if (refreshToken && !isTokenExpired(refreshToken)) {
        try {
          const response = await api.post("/auth/refresh", { refreshToken });
          const newToken = response.data.token || response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          if (newToken) {
            storage.setItem("token", newToken);
            if (newRefreshToken) {
              storage.setItem("refreshToken", newRefreshToken);
            }

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.log("Token refresh failed in response interceptor:", refreshError.message);
        }
      }
    }

    return Promise.reject(error);
  }
);

export const extractApiData = (response) => {
  if (response?.data?.success !== undefined) {
    return response.data.data;
  }
  return response?.data;
};

export const selectApiData = (response) => {
  return extractApiData(response);
};

export default api;
