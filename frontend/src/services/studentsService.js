import axios from './interceptors';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { sleep } from '../utils';

export default {
    exists(field, value) {
        return new Promise((resolve, reject) => {
            const data = { field, value }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/students/exists', data, {})
                .then((response) => {
                    resolve(response.data.exists);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    newStudent(student) {
        return new Promise((resolve, reject) => {
            const data = {
                "name": student.name,
                "lastName": student.lastName,
                "document": student.document,
                "email": student.email,
                "phoneNumber": student.phoneNumber                
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/students', data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getStudentsByCourse(courseId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/students/courses/${courseId}`, {}, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getPendingPayments() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/students/payments/pending', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    newStudents(students) {
        return new Observable(async (subscriber) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const chunkSize = 40;
            let created = [];
            for (let i = 0; i < students.length; i += chunkSize) {
                const currentChunk = i + chunkSize
                const chunk = students.slice(i, currentChunk);
                try {
                    await sleep(2000);
                    let createdStudents = await axios.post(baseUrl + 'api/v1/students', chunk, {});
                    createdStudents = createdStudents.data;
                    createdStudents = Array.isArray(createdStudents) ? createdStudents : [createdStudents];
                    const percentaje = (currentChunk/students.length) * 100;
                    subscriber.next(percentaje);
                } catch {

                }
            }
            subscriber.complete();
        }).pipe(share());
    },
    getStudentsLegacy() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/students/legacy`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getStudents(page, size, filters) {
        return new Promise((resolve, reject) => {
            filters = Object.assign({}, filters)
            let uri = `api/v1/students?page=${page}&size=${size}`
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            if (filters && Object.keys(filters).length > 0) {
                if ('isOrOperation' in filters) {
                    const isOrOperation = filters.isOrOperation
                    delete filters.isOrOperation
                    uri += "&isOrOperation="+isOrOperation
                }
                const queryString = Object.keys(filters)
                    .map(key => {
                        if (filters[key].operation == 'iLike')
                            filters[key].value = '%'+filters[key].value+'%'
                        return `${key} ${filters[key].operation} ${encodeURIComponent(filters[key].value)}`
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
    getStudent(studentId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/students/${studentId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    suspendStudentFromCourse(studentId, courseId, from, to) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            let url = `api/v1/students/${studentId}/courses/${courseId}/suspend?from=${from}`
            if (to != null)
                url = url + "&to=" + to
            axios
                .put(baseUrl + url, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteSuspension(studentId, courseId, from, to) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            let url = `api/v1/students/${studentId}/courses/${courseId}/suspend?from=${from}`
            if (to != null)
                url = url + "&to=" + to
            axios
                .delete(baseUrl + url, {})
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
            const data = {
                "name": student.name,
                "lastName": student.lastName,
                "document": student.document,
                "email": student.email,
                "phoneNumber": student.phoneNumber                
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/students/${studentId}`, data, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/students/${studentId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

