import axios from './interceptors';
import { SPECIFICATION_QUERY_SEPARATOR } from "../constants";
import { sleep } from '../utils';
import { Observable, share } from 'rxjs';

export default {
    uploadFile(file) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const fd = new FormData();
            console.log(file)
            fd.append('file', file[0]);
            axios
                .post(baseUrl + 'api/v1/files', fd, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/files/${fileId}`, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const data = {
                "headquarterId": paymentInfo.headquarterId,
                "clazzId": paymentInfo.clazzId,
                "courseId": paymentInfo.courseId,
                "studentId": paymentInfo.studentId,
                "itemId": paymentInfo.itemId,
                "type": paymentInfo.type,
                "fileId": paymentInfo.fileId,
                "value": paymentInfo.value,
                "at": paymentInfo.at,
                "operativeResult": paymentInfo.operativeResult,
                "note": paymentInfo.note,
                "periodFrom": paymentInfo.periodFrom,
                "periodTo": paymentInfo.periodTo,
                "professorId": paymentInfo.professorId,
                "verified": paymentInfo.verified,
                "driveFileId": paymentInfo.driveFileId,
            }    
            axios
                .post(baseUrl + `api/v1/payments`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    informProfessorPayment(data) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;           
            axios
                .post(baseUrl + `api/v1/courses/add-professor-payment`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    newPayments(payments) {
        return new Observable(async (subscriber) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const chunkSize = 40;
            for (let i = 0; i < payments.length; i += chunkSize) {
                const currentChunk = i + chunkSize
                const chunk = payments.slice(i, currentChunk);
                try {
                    await sleep(100);
                    await axios.post(baseUrl + 'api/v1/payments', chunk, {});
                    const percentaje = (currentChunk/payments.length) * 100;
                    subscriber.next(percentaje);
                } catch {}
            }
            subscriber.complete();
        }).pipe(share());
    },
    deletePayment(paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/payments/${paymentId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editPayment(payment) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/payments/${payment.id}`, payment)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updateUnverifiedPayment(data, paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/payments/${paymentId}`, data)
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/payments/students/${studentId}`, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/payments/courses/${courseId}`, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments', {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            query = typeof query !== "string" ? query.join(SPECIFICATION_QUERY_SEPARATOR) : query;
            axios
                .get(baseUrl + 'api/v1/payments?q=' + query, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getAllByYear(byCreatedAt, from = new Date()) {
        const startOfYear = new Date(from.getFullYear(), 0, 1).getTime();
        const endOfYear = new Date(from.getFullYear(), 11, 31).getTime();
        const field = byCreatedAt ? "createdAt" : "at";
        return this.getByQuery(`${field} between ${startOfYear}:${endOfYear}`)
            .then(data => ({ data, period: { from: startOfYear, to: endOfYear } }));
    },
    getAllByMonth(byCreatedAt, from = new Date()) {
        const startOfMonth = new Date(from.getFullYear(), from.getMonth(), 1).getTime();
        const endOfMonth = new Date(from.getFullYear(), from.getMonth() + 1, 0).getTime();
        const field = byCreatedAt ? "createdAt" : "at";
        return this.getByQuery(`${field} between ${startOfMonth}:${endOfMonth}`)
            .then(data => ({ data, period: { from: startOfMonth, to: endOfMonth } }));
    },
    getAllByWeek(byCreatedAt, from = new Date()) {
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
        const field = byCreatedAt ? "createdAt" : "at";
        return this.getByQuery(`${field} between ${prevMonday}:${until}`)
            .then(data => ({ data, period: { from: prevMonday, to: until } }));
    },
    verifyPayment(paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/payments/${paymentId}/verified`, {verified: true})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

