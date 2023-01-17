import axios from "axios";

export default {
    authUser(userBody) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_BACKEND_HOST; 
            axios
                .post(baseUrl + 'users/login', userBody)
                .then((response) => {
                    resolve(response.data.token);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    }
};

