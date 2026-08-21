// import axios from "axios";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_URL,
// });

// export default api;

import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api",
  // baseURL: "https://fpnqchft-5000.inc1.devtunnels.ms/api",
  timeout: 30000,
});

export default axiosInstance;