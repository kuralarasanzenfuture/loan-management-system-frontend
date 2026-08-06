import api from "../../common/services/api";

export const login = async (credentials) => {
  try {
    const response = await api.post("/users/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const getMe = async () => {
  try {
    const response = await api.get("/users/me");
    // console.log("getMe response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const refreshToken = async () => {
  try {
    const response = await api.post("/users/refresh-token");
    return response.data;
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

// export const logout = async () => {
//   try {
//     const response = await api.post("/users/logout");
//     return response.data;
//   } catch (error) {
//     console.error("Error logging out:", error);
//     throw error; // Rethrow the error to be handled by the caller
//   }
// };

export const logout = async (data = {}) => {
  try {
    const refreshToken = data?.refreshToken || localStorage.getItem("refreshToken");
    const session_id = data?.session_id || localStorage.getItem("sessionId");

    const response = await api.post("/users/logout", {
      refreshToken,
      session_id,
    });

    return response.data;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const logoutAllDevices = async () => {
  try {
    const response = await api.post("/users/logout-all");
    return response.data;
  } catch (error) {
    console.error("Error logging out from all devices:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};
