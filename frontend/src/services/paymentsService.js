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
    splitPayment(paymentData, paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + `api/v1/payments/${paymentId}/split`, paymentData, {})
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
    generateReceipt(paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/payments/${paymentId}/receipt`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    informPayment(paymentInfo, sendReceipt) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;  
            axios
                .post(baseUrl + `api/v1/payments${sendReceipt ? '?sendEmail=true' : ''}`, paymentInfo, {})
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
    editPayment(payment, sendReceipt) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/payments/${payment.id}${sendReceipt ? '?sendEmail=true' : ''}`, payment)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updatePayment(data, paymentId) {
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
    legacyGetAll() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments/legacy', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getAllPaymentsVerified(page, size, filters, isOrOperation) {
        return new Promise((resolve, reject) => {            
            let uri = `api/v1/payments/verified?page=${page}&size=${size}&isOrOperation=${isOrOperation}`
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            
            if (filters && Object.keys(filters).length > 0) {
                const queryString = Object.keys(filters)
                    .map(key => {
                        if (key == 'all') return ''
                        if (key == 'at' || key == 'operativeResult') {
                            if (filters[key].value == null) return '';
                            if (typeof filters[key].value === 'string') {
                                return filters[key].value;
                            }
                            const startAt = new Date(filters[key].value.getTime());
                            startAt.setHours(0, 0, 0, 0);
                            const endAt = new Date(filters[key].value.getTime());
                            endAt.setHours(23, 59, 59, 999);
                            return `${key} between ${startAt.getTime()}:${endAt.getTime()}`
                        } else {
                            if (filters[key].operation == 'iLike')
                                filters[key].value = '%'+filters[key].value+'%'
                            return `${key} ${filters[key].operation} ${encodeURIComponent(filters[key].value)}`
                        }
                    })
                    .join(';');
                uri += `&q=${queryString}`;
            }
            if (filters != null && "all" in filters)
                uri += "&all=" + filters.all;
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
    getAllPaymentsUnverified(page, size, filters, isOrOperation) {
        return new Promise((resolve, reject) => {            
            let uri = `api/v1/payments/unverified?page=${page}&size=${size}&isOrOperation=${isOrOperation}`
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            if (filters && Object.keys(filters).length > 0) {
                const queryString = Object.keys(filters)
                    .map(key => {
                        if (key == 'all') return ''
                        if (key == 'at' || key == 'operativeResult') {
                            if (filters[key].value == null) return '';
                            if (typeof filters[key].value === 'string') {
                                return filters[key].value;
                            }
                            const startAt = new Date(filters[key].value.getTime());
                            startAt.setHours(0, 0, 0, 0);
                            const endAt = new Date(filters[key].value.getTime());
                            endAt.setHours(23, 59, 59, 999);
                            return `${key} between ${startAt.getTime()}:${endAt.getTime()}`
                        } else {
                            if (filters[key].operation == 'iLike')
                                filters[key].value = '%'+filters[key].value+'%'
                            return `${key} ${filters[key].operation} ${encodeURIComponent(filters[key].value)}`
                        }
                    })
                    .join(';');
                uri += `&q=${queryString}`;
            }
            if (filters != null && "all" in filters)
                uri += "&all=" + filters.all;
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
    getAllPayments(page, size, filters) {
        return new Promise((resolve, reject) => {            
            let uri = `api/v1/payments?page=${page}&size=${size}`
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            if (filters && Object.keys(filters).length > 0) {
                const queryString = Object.keys(filters)
                    .map(key => {
                        if (key == 'at' || key == 'operativeResult') {
                            if (filters[key].value == null) return '';
                            const startAt = new Date(filters[key].value.getTime());
                            startAt.setHours(0, 0, 0, 0);
                            const endAt = new Date(filters[key].value.getTime());
                            endAt.setHours(23, 59, 59, 999);
                            return `${key} between ${startAt.getTime()}:${endAt.getTime()}`
                        } else {
                            if (filters[key].operation == 'iLike')
                                filters[key].value = '%'+filters[key].value+'%'
                            return `${key} ${filters[key].operation} ${encodeURIComponent(filters[key].value)}`
                        }
                    })
                    .join(';');
                uri += `&q=${queryString}`;
            }
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
    getLastSecretaryPayment() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments/secretary/lastest', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getSecretaryPayments() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/payments/secretary', {})
                .then((response) => {
                    const secretaryPayments = response.data.map(sp => ({ ...sp, createdAt: new Date(sp.createdAt) }))
                    resolve(secretaryPayments);
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
                .get(baseUrl + 'api/v1/payments/legacy?q=' + query, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getAllByYear(byCreatedAt, byOpResult, from = new Date()) {
        from.setSeconds(0)
        from.setMilliseconds(0)
        const startOfYearDate = new Date(from.getFullYear(), 0, 1);
        startOfYearDate.setSeconds(0)
        startOfYearDate.setMilliseconds(0)
        const startOfYear = startOfYearDate.getTime();
        const endOfYearDate = new Date(from.getFullYear(), 11, 31);
        endOfYearDate.setSeconds(59)
        endOfYearDate.setMilliseconds(999)
        const endOfYear = endOfYearDate.getTime()
        const field = byCreatedAt ? "createdAt" : (byOpResult ? "operativeResult" : "at");
        return this.getByQuery(`${field} between ${startOfYear}:${endOfYear}`)
            .then(data => ({ data, period: { from: startOfYear, to: endOfYear } }));
    },
    getAllByMonth(byCreatedAt, byOpResult, from = new Date()) {
        from.setSeconds(0)
        from.setMilliseconds(0)
        const startOfMonthDate = new Date(from.getFullYear(), from.getMonth(), 1);
        startOfMonthDate.setSeconds(0)
        startOfMonthDate.setMilliseconds(0)
        const endOfMonthDate = new Date(from.getFullYear(), from.getMonth() + 1, 0);
        endOfMonthDate.setSeconds(59)
        endOfMonthDate.setMilliseconds(999)
        const startOfMonth = startOfMonthDate.getTime();
        const endOfMonth =  endOfMonthDate.getTime();
        const field = byCreatedAt ? "createdAt" : (byOpResult ? "operativeResult" : "at");
        return this.getByQuery(`${field} between ${startOfMonth}:${endOfMonth}`)
            .then(data => ({ data, period: { from: startOfMonth, to: endOfMonth } }));
    },
    getAllByWeek(byCreatedAt, byOpResult, from = new Date()) {
        from.setSeconds(0)
        from.setMilliseconds(0)
        let prevMonday = from;
        prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() == 1 ? 7 : (prevMonday.getDay() + (7 - 1)) % 7 ));
        prevMonday.setHours(0);
        prevMonday.setMinutes(0);
        prevMonday.setSeconds(0);
        let until = new Date();
        until.setDate(prevMonday.getDate() + 6);
        until.setHours(23);
        until.setMinutes(59);
        from.setSeconds(59)
        from.setMilliseconds(999)
        until = until.getTime();
        prevMonday = prevMonday.getTime();
        const field = byCreatedAt ? "createdAt" : (byOpResult ? "operativeResult" : "at");
        return this.getByQuery(`${field} between ${prevMonday}:${until}`)
            .then(data => ({ data, period: { from: prevMonday, to: until } }));
    },
    verifyPayment(paymentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/payments/${paymentId}/verified`, {verified: true})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    createMercadoPagoPreference(paymentData) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/payments/mercadopago/preference', paymentData)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.response?.data || error.data)
                })
        });
    },

    generateMercadoPagoQR(qrData) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/payments/mercadopago/qr', qrData, {
                    responseType: 'arraybuffer' // Para recibir la imagen como buffer
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.response?.data || error.data)
                })
        });
    },

    sendMercadoPagoEmail(emailData) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/payments/mercadopago/email', emailData)
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.response?.data || error.data)
                })
        });
    },

    exportPayments(query) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            query = typeof query !== "string" ? query.join(SPECIFICATION_QUERY_SEPARATOR) : query;
            axios
                .get(baseUrl + 'api/v1/payments/export?q=' + query, {
                    responseType: 'arraybuffer'
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.response?.data || error.data)
                })
        });
    },
};
