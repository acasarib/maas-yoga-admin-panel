import axios from './interceptors';
import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';
import { sleep } from '../utils';

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
    getStudents() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/students', {})
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

