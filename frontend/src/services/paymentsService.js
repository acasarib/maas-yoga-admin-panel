import axios from "axios";

export default {
    uploadFile(file) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const fd = new FormData();
            console.log(file)
            fd.append('file', file[0]);
            axios
                .post(baseUrl + 'api/v1/files', fd, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getFile(fileId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/files/${fileId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    informPayment(paymentInfo) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const data = {
                "courseId": paymentInfo.courseId,
                "type": paymentInfo.paymentType,
                "fileId": paymentInfo.fileId,
                "value": paymentInfo.paymentValue,
                "at": paymentInfo.at
            }                
            axios
                .post(baseUrl + `api/v1/payments/students/${paymentInfo.studentId}`, data, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getStudentPayments(studentId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/payments/students/${studentId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCoursePayments(courseId) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/payments/courses/${courseId}`, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getAllPayments() {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments', { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getByQuery(query) {
        return new Promise((resolve, reject) => {
            const accessToken = localStorage.getItem('accessToken')
            let headers = { Authorization: `Bearer ${accessToken}` }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments?q=' + query, { headers })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getAllByYear() {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        const endOfYear = new Date(new Date().getFullYear(), 11, 31).getTime();
        return this.getByQuery(`at between ${startOfYear}:${endOfYear}`);
    },
    getAllByMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime();
        return this.getByQuery(`at between ${startOfMonth}:${endOfMonth}`)
    },
    getAllByWeek() {
        let prevMonday = new Date();
        prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() == 1 ? 7 : (prevMonday.getDay() + (7 - 1)) % 7 ));
        const now = new Date().getTime();
        prevMonday = prevMonday.getTime();
        return this.getByQuery(`at between ${prevMonday}:${now}`);
    },
};

