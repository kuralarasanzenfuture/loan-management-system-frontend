// import axiosInstance from "./axios";

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("accessToken");

//     if (token && token !== "undefined" && token !== "null") {
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

// axiosInstance.interceptors.response.use(
//   (response) => response,

//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem("accessToken");
//       localStorage.removeItem("refreshToken");
//       localStorage.removeItem("user");

//       window.location.href = "/";
//     }

//     return Promise.reject(error);
//   },
// );

// export default axiosInstance;


import axiosInstance from "./axios";
import { refreshToken } from "../../redux/auth/auth.service.js";

let isRefreshing = false;
let failedQueue = [];

// Helper to process queued requests once token is refreshed
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && token !== "undefined" && token !== "null") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid infinite loop if the refresh-token endpoint itself returns 401
      if (originalRequest.url?.includes("/users/refresh-token")) {
        clearAuthAndRedirect();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Call your refresh token API
        const data = await refreshToken();
        
        // Adjust property path based on your API response structure (e.g., data.accessToken or data.data.accessToken)
        const newAccessToken = data.accessToken; 

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);

          // Update header for current failed request
          axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry the original failed request
          return axiosInstance(originalRequest);
        } else {
          throw new Error("No token returned from refresh endpoint");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to clear storage and logout
function clearAuthAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  window.location.href = "/";
}

export default axiosInstance;
