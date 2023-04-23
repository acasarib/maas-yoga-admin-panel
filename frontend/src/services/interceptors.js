import axios from "axios";
import { useNavigate } from "react-router-dom";

let navigate = useNavigate();

axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {
    if(!localStorage.getItem('accessToken')) {
        console.log('asasas')
        navigate('/');
    }
    if(error.error && (error.error === 'Invalid token')) {
        console.log('asasas')
        localStorage.removeItem('accessToken');
        navigate('/');
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });
