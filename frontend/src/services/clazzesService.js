import axios from './interceptors';

export default {
    newClazz(clazzData) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": clazzData.title,
                "professor": clazzData.professor,
                "startAt": clazzData.startAt              
            }            
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/clazzes', data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getClazzes() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/clazzes', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getClazz(clazzId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/clazzes/${clazzId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editclazz(clazzId, clazzData) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": clazzData.title,
                "professor": clazzData.professor,
                "startAt": clazzData.startAt,
                "paymentsVerified": clazzData.paymentsVerified           
            }  
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/clazzes/${clazzId}`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteClazz(clazzId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/clazzes/${clazzId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

