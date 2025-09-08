import Axios from "axios";

const axios = Axios.create({
  
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 12000000,
});

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
  
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);


axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (typeof error !== undefined) {
      if (error.hasOwnProperty("response")) {
        const errorStatusCode = error.response.status;
        if (errorStatusCode === 401 || errorStatusCode === 403) {
          const router = useRouter();
          return router.push({
            path: "/login",
          });
        }
      }
    }

    return Promise.reject(error);
  }
);
export default axios;
