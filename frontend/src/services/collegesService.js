import axios from './interceptors';

export default {
    newCollege(collegeData) {
        return new Promise((resolve, reject) => {
            const data = {
                "name": collegeData.name,
                "location": collegeData.location
            }            
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/headquarters', data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getColleges() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/headquarters', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCollege(collegeId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/headquarters/${collegeId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editCollege(collegeId, collegeData) {
        return new Promise((resolve, reject) => {
            const data = {
                "name": collegeData.name,
                 "location": collegeData.location
            }  
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/headquarters/${collegeId}`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteCollege(collegeId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/headquarters/${collegeId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    addCourses(collegeId, list) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            console.log(list)
            axios
                .put(baseUrl + `api/v1/headquarters/${collegeId}/courses`, list, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    }
};

