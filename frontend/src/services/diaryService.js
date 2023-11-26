import axios from './interceptors';

export default {
    getUsers() {
        return new Promise((resolve, reject) => {
            const data = {
                "string": null,
                "id_estado": "2",
                "id_permiso": "3",
                "id_cuota": null,
                "indexed_user": null,
                "limit": 25,
                "offset": 0
            }
            const baseUrl = process.env.REACT_APP_DIARY_BACKEND_HOST;
            axios
                .post(baseUrl + 'search', data, {})
                .then((response) => {
                    console.log(response);
                    console.log(response.data);
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

