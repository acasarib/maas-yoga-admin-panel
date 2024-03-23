import axios from './interceptors';
import jwt_decode from "jwt-decode";

export default {
    authUser(userBody) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/users/login', userBody)
                .then((response) => {
                    var token = response.data.token;
                    var decoded = jwt_decode(token);
                    localStorage.setItem('userInfo', JSON.stringify(decoded));
                    resolve(response.data.token);
                })
                .catch((error) => {
                    console.error(error);
                    reject(error.data)
                })
        });
    },
    createUser(user) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/users/register', user, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteUser(email) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/users/${email}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updateUser(email, user) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/users/${email}`, user, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getUsers() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/users', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getHealth() {
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
    },
};
