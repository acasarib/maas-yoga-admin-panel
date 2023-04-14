import axios from "axios";

export default {
    newCategory(category) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/categories', category, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCategories() {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/categories', { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/categories/${categoryId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editCategory(categoryId, categoryData) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
        
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/categories/${categoryId}`, categoryData, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteCategory(categoryId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/categories/${categoryId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

