import axios from "axios";

export default {
    newStudent(student) {
        return new Promise((resolve, reject) => {
            const data = {
                "name": student.name,
                "lastName": student.lastName,
                "document": student.document,
                "email": student.email,
                "phoneNumber": student.phoneNumber                
            }
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/student', data, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getStudents() {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/students', { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getStudent(studentId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/student/${studentId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editStudent(studentId, student) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            const data = {
                "name": student.name,
                "lastName": student.lastName,
                "document": student.document,
                "email": student.email,
                "phoneNumber": student.phoneNumber                
            }
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/student/${studentId}`, data, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteStudent(studentId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` };
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/students/${studentId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

