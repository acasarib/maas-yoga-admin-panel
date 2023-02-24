import axios from "axios";
import { SPECIFICATION_QUERY_SEPARATOR } from "../constants";

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
            query = typeof query !== "string" ? query.join(SPECIFICATION_QUERY_SEPARATOR) : query;
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
    getAllByYear(from = new Date()) {
        const startOfYear = new Date(from.getFullYear(), 0, 1).getTime();
        const endOfYear = new Date(from.getFullYear(), 11, 31).getTime();
        return this.getByQuery(`at between ${startOfYear}:${endOfYear}`)
            .then(data => ({ data, period: { from: startOfYear, to: endOfYear } }));
    },
    getAllByMonth(from = new Date()) {
        const startOfMonth = new Date(from.getFullYear(), from.getMonth(), 1).getTime();
        const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0).getTime();
        return this.getByQuery(`at between ${startOfMonth}:${endOfMonth}`)
            .then(data => ({ data, period: { from: startOfMonth, to: endOfMonth } }));
    },
    getAllByWeek(from = new Date()) {
        let prevMonday = from;
        prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() == 1 ? 7 : (prevMonday.getDay() + (7 - 1)) % 7 ));
        prevMonday.setHours(0);
        prevMonday.setMinutes(0);
        let until = new Date();
        until.setDate(prevMonday.getDate() + 6);
        until.setHours(23);
        until.setMinutes(59);
        until = until.getTime();
        prevMonday = prevMonday.getTime();
        return this.getByQuery(`at between ${prevMonday}:${until}`)
            .then(data => ({ data, period: { from: prevMonday, to: until } }));
    },
};

