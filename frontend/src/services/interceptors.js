import axios from "axios";

axios.interceptors.response.use((response) => {
    return response;
  }, (error) => {
    if(error.response && error.response.data && (error.response.data.error === 'Invalid token')) {
      console.log('asssgdfbchfth')
      window.location.href = "/";
    }
    return Promise.reject(error);
});

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;