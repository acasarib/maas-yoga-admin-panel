import axios from "axios";

export default {
    authUser(userBody) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/users/login', userBody)
                .then((response) => {
                    resolve(response.data.token);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

export const getHealth = async () => {
    return new Promise((resolve, reject) => {
        const healthUrl = process.env.REACT_APP_HEALTHCHECK;
        axios
            .get(healthUrl)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(error.data)
            })
    });
}

