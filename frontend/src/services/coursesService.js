import axios from './interceptors';

export default {
    newCourse(courseData) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": courseData.title,
                "description": courseData.description,
                "startAt": courseData.startAt,
                "duration": courseData.duration,
                "criteria": courseData.criteria,
                "criteriaValue": courseData.criteriaValue,
                "professor": courseData.professor,
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/courses', data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCourses() {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/courses', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCourse(courseId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/courses/${courseId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    editCourse(courseId, courseData) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": courseData.title,
                "description": courseData.description,
                "startAt": courseData.startAt,
                "duration": courseData.duration,
                "criteria": courseData.criteria,
                "criteriaValue": courseData.criteriaValue,
                "professor":courseData.professor,
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/courses/${courseId}`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    deleteCourse(courseId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/courses/${courseId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    addStudent(courseId, list) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            console.log(list)
            axios
                .put(baseUrl + `api/v1/courses/${courseId}/students`, list, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    associateTask(courseId, task) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": task.title,
                "description": task.description,
                "comment": task.comment,
                "limitDate": task.limitDate
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + `api/v1/courses/${courseId}/tasks`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    associateStudentToTask(courseId, task) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": task.title,
                "description": task.description,
                "comment": task.comment,
                "limitDate": task.limitDate
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + `api/v1/courses/${courseId}/tasks`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    associateStudentToTask(taskId, list) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/courses/tasks/${taskId}/students`, list, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    changeTaskStatus(taskId, studentId, taskStatus) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const status = { "completed": taskStatus };
            axios
                .put(baseUrl + `api/v1/courses/tasks/${taskId}/students/${studentId}`, status, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    calcProfessorsPayments(from, to) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const period = { from, to };
            axios
                .post(baseUrl + `api/v1/courses/calc-professors-payments`, period, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

