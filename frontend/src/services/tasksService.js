import axios from "axios";

export default {
    createTask(newTask) {
        return new Promise((resolve, reject) => {
            const task = {
                "title": newTask.title,
                "description": newTask.description
            }                
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/tasks', task, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getTasks() {
        return new Promise((resolve, reject) => {              
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/tasks', { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getTask(taskId) {
        return new Promise((resolve, reject) => {              
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/tasks/${taskId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editTask(editedTask) {
        return new Promise((resolve, reject) => {
            const task = {
                "title": editedTask.title,
                "description": editedTask.description,
                "completed": editedTask.completed
            }                
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/tasks/${editedTask.id}`, task, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteTask(taskId) {
        return new Promise((resolve, reject) => {              
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/tasks/${taskId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

