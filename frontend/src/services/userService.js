import axios from "axios";

export default {
    authUser(userBody) {
        return new Promise((resolve, reject) => {
            //const baseUrl = process.env.REACT_BACKEND_HOST; 
            axios
                .post('https://maas-yoga-admin-panel.onrender.com/api/v1/users/login', userBody)
                .then((response) => {
                    resolve(response.data.token);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    }
};

