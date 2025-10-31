import axios from './interceptors';

export default {
    newCourse(courseData) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/courses', courseData, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    copyTasks(sourceCourseId, targetCourseId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + `api/v1/courses/tasks/copy?source=${sourceCourseId}&target=${targetCourseId}`, {}, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCoursesByTitle(title) {
        return new Promise((resolve, reject) => {
            let url = 'api/v1/courses';
            if (title != undefined) {
                url += "?title=" + title
            }
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + url, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getCourses(page, size, title) {
        return new Promise((resolve, reject) => {
            let url = `api/v1/courses?page=${page}&size=${size}`;
            if (title != undefined)
                url = url + `&title=${title}`;
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + url, {})
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
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/courses/${courseId}`, courseData, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updateInscriptionDate(studentId, courseId, inscriptionDate) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/courses/${courseId}/students/${studentId}/update-inscription-date`, { inscriptionDate }, {})
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
    deleteCourseTask(taskId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .delete(baseUrl + `api/v1/courses/tasks/${taskId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updateCourseTask(task) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/courses/tasks/${task.id}`, task, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    calcProfessorsPayments(from, to, professorId, courseId) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const period = { from, to, professorId, courseId };
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
    exportProfessorsPayments(from, to, courseId = null, professorId = null) {
        return new Promise((resolve, reject) => {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const period = { from, to };
            if (courseId) period.courseId = courseId;
            if (professorId) period.professorId = professorId;
            
            axios
                .post(baseUrl + `api/v1/courses/export-professors-payments`, period, {
                    responseType: 'blob'
                })
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

