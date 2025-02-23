import axios from './interceptors';

export default {
    getAll(page, size, searchField, searchValue) {
        let uri = `api/v1/logs?page=${page}&size=${size}`
        if (searchField != undefined && searchField != null)
            uri += `&${searchField}=${searchValue}`
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + uri, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

