import axios from './interceptors';

export default {
    createTask(newTask) {
        return new Promise((resolve, reject) => {
            const task = {
                "title": newTask.title,
                "description": newTask.description
            }                
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/tasks', task, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/tasks', {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/tasks/${taskId}`, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/tasks/${editedTask.id}`, task, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/tasks/${taskId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

