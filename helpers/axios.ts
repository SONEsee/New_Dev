// import Axios from "axios";

// const axios = Axios.create({
  
//   baseURL: import.meta.env.VITE_BASE_URL,
//   timeout: 12000000,
// });

// // Add a request interceptor
// axios.interceptors.request.use(
//   function (config) {
  
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   function (error) {
//     return Promise.reject(error);
//   }
// );


// axios.interceptors.response.use(
//   function (response) {
//     return response;
//   },
//   function (error) {
//     if (typeof error !== undefined) {
//       if (error.hasOwnProperty("response")) {
//         const errorStatusCode = error.response.status;
//         if (errorStatusCode === 401 || errorStatusCode === 403) {
//           const router = useRouter();
//           return router.push({
//             path: "/login",
//           });
//         }
//       }
//     }

//     return Promise.reject(error);
//   }
// );
// export default axios;

// @/helpers/axios.ts
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

// Add a response interceptor
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (typeof error !== 'undefined' && error.hasOwnProperty('response')) {
      const errorStatusCode = error.response?.status;
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || '';
      
      // Handle 401 (Unauthorized) or 403 (Forbidden)
      if (errorStatusCode === 401 || errorStatusCode === 403) {
        
        // Check if token was revoked/terminated
        const isRevokedToken = errorMessage.toLowerCase().includes('revoked') || 
                               errorMessage.toLowerCase().includes('terminated') ||
                               errorMessage.toLowerCase().includes('invalid');
        
        // Clear all authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');
        
        // Show appropriate message
        if (isRevokedToken) {
          // User was force logged out by admin
          if (typeof window !== 'undefined') {
            alert('ເຊັດຊັນຂອງທ່ານຖືກຍົກເລີກໂດຍຜູ້ດູແລລະບົບ\nYour session has been terminated by administrator.\nກະລຸນາເຂົ້າສູ່ລະບົບໃໝ່');
          }
        } else {
          // Token expired or other auth issue
          if (typeof window !== 'undefined') {
            console.log('Session expired or invalid. Redirecting to login...');
          }
        }
        
        // Redirect to login page
        const router = useRouter();
        router.push({ path: "/login" });
        
        // Return a rejected promise to stop execution
        return Promise.reject(new Error('Session terminated'));
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
