import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;
let queue = []; // { resolve, reject } waiting on the in-flight refresh

function flushQueue(error, newAccessToken) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccessToken);
  });
  queue = [];
}

axiosInstance.interceptors.response.use(
  (value) => value.data,
  async (error) => {
    const original = error.config;
    const status = error.response.status;
    const errorData = error.response.data;

    if (status !== 401 || original._retry) {
      return Promise.reject(errorData);
    }

    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
      return Promise.reject(errorData);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newAccessToken) => {
        original.headers.authorization = `Bearer ${newAccessToken}`;
        original._retry = true;
        return axiosInstance(original);
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        "auth/refresh-token",
        {},
        {
          baseURL: import.meta.env.VITE_API_URL,
          headers: { Authorization: `Bearer ${refreshToken}` },
        },
      );

      const { data } = response.data;
      const { accessToken, refreshToken: newRefreshToken } = data;

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", newRefreshToken);

      flushQueue(null, accessToken);

      original._retry = true;
      original.headers.authorization = `Bearer ${accessToken}`;
      return axiosInstance(original);
    } catch (error) {
      flushQueue(error, null);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");

      window.location.href = "/login";

      return Promise.reject(error.response?.data ?? error.message);
    } finally {
      isRefreshing = false;
    }
  },
);
