import React, { createContext, useEffect, useState } from "react";
import studentsService from "../services/studentsService";
import coursesService from "../services/coursesService";
import tasksService from "../services/tasksService";
import clazzesService from "../services/clazzesService";
import collegesService from "../services/collegesService";
import paymentsService from "../services/paymentsService";
import notificationsService from "../services/notificationsService";
import professorsService from "../services/professorsService";
import templatesService from "../services/templatesService";
import categoriesService from "../services/categoriesService";
import userService from "../services/userService";
import { APP_VERSION, CASH_PAYMENT_TYPE, STUDENT_MONTHS_CONDITIONS } from "../constants";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleApiProvider } from 'react-gapi'
import agendaService from "../services/agendaService";
import { series } from "../utils";
import useToggle from "../hooks/useToggle";

export const Context = createContext();

export const Provider = ({ children }) => {
    const [colleges, setColleges] = useState([]);
    const [isLoadingColleges, setIsLoadingColleges] = useState(true);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [lastSecretaryPayment, setLastSecretaryPayment] = useState(null)
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [clazzes, setClazzes] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const isLoadingCategories = useToggle()
    const [categories, setCategories] = useState([]);
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertStatus, setAlertStatus] = useState('');
    const [professors, setProfessors] = useState([]);
    const [isLoadingProfessors, setIsLoadingProfessors] = useState(true);
    const [agendaLocations, setAgendaLocations] = useState([]);

    const getClazzes = async (force = false) => {
        if (!force && clazzes.length > 0) return clazzes;
        const data = await clazzesService.getClazzes();
        setClazzes(data);
        return data;
    };

    const getItems = async () => {
        if (items.length > 0) return items;
        const data = await categoriesService.getItems();
        setItems(data);
        return data;
    }

    const getServices = async (force = false) => {
        if (!force && services.length > 0) return services;
        const data = await templatesService.getServices();
        setServices(data);
        return data
    }

    const getCategories = async (force = false) => {
        if (!force && categories.length > 0) return categories;
        isLoadingCategories.enable()
        const data = await categoriesService.getCategories();
        isLoadingCategories.disable()
        setCategories(data);
        return data;
    }

    const getProfessors = async (force = false) => {
        if (!force && professors.length > 0) return professors;
        setIsLoadingProfessors(true)
        const pfrs = await professorsService.getProfessors();
        setProfessors(pfrs);
        setIsLoadingProfessors(false);
        return pfrs
    }


    const getAgendaLocations = async () => {
        if (agendaLocations.length > 0) return agendaLocations;
        const data = await agendaService.getLocations();
        data.forEach(location => {
            location.label = location.nombre;
            location.value = location.id;
        });
        setAgendaLocations(data);
        return data
    }

    const getTasks = async (force = false) => {
        if (!force && tasks.length > 0) return tasks;
        setIsLoadingTasks(true)
        const tasksList = await tasksService.getTasks();
        setIsLoadingTasks(false)
        setTasks(tasksList);
        return tasksList
    }

    const getColleges = async (force = false) => {
        if (force === false && colleges.length > 0) return colleges;
        setIsLoadingColleges(true)
        const data = await collegesService.getColleges();
        setIsLoadingColleges(false)
        setColleges(data);
        return data;
    };

    const generateReceipt = async (paymentId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}api/v1/payments/${paymentId}/receipt`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            const arrayBuffer = await response.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
    
            if (!(blob instanceof Blob)) {
                throw new Error('No se generó un Blob válido');
            }
    
            console.log(response, 'response', blob, 'blob', arrayBuffer, 'arrayBuffer');
            
            return blob;
        } catch (error) {
            changeAlertStatusAndMessage(
                true,
                'error',
                'No fue posible generar el recibo... Por favor inténtelo nuevamente.'
            );
            console.error('Error en generateReceipt:', error);
            return null; // 👈 IMPORTANTE: devolvé algo si ocurre error
        }
    };

    useEffect(() => {
        console.log("App running version=" + APP_VERSION);
        if (user === null) return;
        const getUsers = async () => {
            try {
              const usersList = await userService.getUsers();
              setUsers(usersList);
            }catch {
              changeAlertStatusAndMessage(true, 'error', 'No fue posible obtener los usuarios... Por favor recarge la página.');
            }
        }
        const getNotifications = async () => {
            const notifications = await notificationsService.getNotifications();
            setNotifications(notifications)
        }
        
        getNotifications();
        getUsers();
    }, [user]);

    

    const removeNotification = async (notificationId) => {
        await notificationsService.removeById(notificationId)
        setNotifications(notifications.filter(n => n.id !== notificationId))
    }

    const clearNotifications = async () => {
        await Promise.all(notifications.map(notification => notificationsService.removeById(notification.id)))
        setNotifications([])
    }

    const getStudentPayments = async (studentId) => {
        return paymentsService.getStudentPayments(studentId);
    }

    const getAgendaCashValues = async (year, month, location) => {
        return agendaService.getCash(year, month, location);
    }

    const merge = (item1, item2) => {
        for (let key in item1) {
            if (key in item2)
                item1[key] = item2[key];
        }
        return JSON.parse(JSON.stringify(item1));
    }

    const getUserById = userId => users.find(user => user.id == userId);

    const getProfessorDetailsById = async (professorId) => {
        const professor = await professorsService.getProfessor(professorId);
        return professor;
    }

    const getPendingProfessorPayments = async () => {
        const pendingPayments = await professorsService.getPendingPayments();
        return pendingPayments;
    }

    const getCourseDetailsById = async (courseId) => {
        return coursesService.getCourse(courseId);
    }

    const getStudentsByCourse = (courseId) => {
        return studentsService.getStudentsByCourse(courseId);
    }

    const getStudentDetailsById = async studentId => {
        return studentsService.getStudent(studentId);
    }

    const newProfessorPayment = async (professorId, courseId, periodFrom, periodTo, value) => {
        const payment = {
            professorId,
            courseId,
            periodFrom,
            periodTo,
            at: new Date(),
            operativeResult: new Date(periodFrom.slice(0, -2) + "15"),
            type: CASH_PAYMENT_TYPE,
            value: value*-1,
            verified: false,
        }
        await informPayment(payment);
        const professor = await professorsService.getProfessor(professorId);
        setProfessors(JSON.parse(JSON.stringify(professors.map(p => {
            if (p.id === professorId) {
                return professor
            }
            return p;
        }))));
    }

    const informPayment = async (payment, sendReceipt) => {
        try {
            const createdPayment = await paymentsService.informPayment(payment, sendReceipt);
            changeAlertStatusAndMessage(true, 'success', 'El movimiento fue informado exitosamente!')
            createdPayment.user = user;
            setPayments(current => [...current, createdPayment]);
            return createdPayment;
        } catch(e) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser informado... Por favor inténtelo nuevamente.');
        }
    };

    const editPayment = async (payment, sendReceipt) => {
        try {
            const editedPayment = await paymentsService.editPayment(payment, sendReceipt);
            changeAlertStatusAndMessage(true, 'success', 'El movimiento fue editado exitosamente!')
            editedPayment.user = user;
            setPayments(current => current.map(p => p.id === payment.id ? merge(p, editedPayment) : p));
        } catch(e) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser editado... Por favor inténtelo nuevamente.');
        }
    };

    const verifyPayment = async (paymentId, paymentData) => {
        const veryfiedPayment = await paymentsService.verifyPayment(paymentId);
        changeAlertStatusAndMessage(true, 'success', 'El pago fue verificado exitosamente!');
        setPayments(current => current.map(p => {
            if (p.id === paymentId) {
                p.verified = true
                for (const key of Object.keys(paymentData)) {
                    p[key] = paymentData[key]
                }
                p.user = users.find(u => u.id === p.userId)
            }
            return p
        }));
        return veryfiedPayment;
    }

    const splitPayment = async (paymentData, paymentId) => {
        await paymentsService.splitPayment(paymentData, paymentId)
    }

    const deletePayment = async (id) => {
        await paymentsService.deletePayment(id);
        setPayments(current => current.filter(p => p.id !== id));
        changeAlertStatusAndMessage(true, 'success', 'El pago fue eliminado');
    }

    const deleteUser = async (email) => {
        await userService.deleteUser(email);
        setUsers(current => current.filter(p => p.email !== email));
    }

    const editUser = async (email, user) => {
        const editedUser = await userService.updateUser(email, user);
        changeAlertStatusAndMessage(true, 'success', 'El usuario fue editado exitosamente!')
        setUsers(current => current.map(s => s.email === email ? merge(s, editedUser) : s));
    }

    const deleteCollege = async collegeId => {
        await collegesService.deleteCollege(collegeId);
        changeAlertStatusAndMessage(true, 'success', 'La sede fue borrada exitosamente!')
        setColleges(current => current.filter(college => college.id !== collegeId));
    };

    const addCoursesToCollege = async (collegeId, coursesIds) => {
        const collegeEdited = await collegesService.addCourses(collegeId, coursesIds);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue agregado exitosamente!')
        collegeEdited.label = collegeEdited.title;
        collegeEdited.value = collegeEdited.id;
        setColleges(current => current.map(college => college.id === collegeId ? collegeEdited : college));
        return collegeEdited;
    };

    const newCollege = async (college) => {
        const createdCollege = await collegesService.newCollege(college);
        changeAlertStatusAndMessage(true, 'success', 'La sede fue creada exitosamente!')
        createdCollege.label = createdCollege.name;
        createdCollege.value = createdCollege.id;
        const newColleges = JSON.parse(JSON.stringify(colleges))
        newColleges.push(createdCollege)
        setColleges(newColleges);
        return newColleges;
    }

    const newProfessor = async (professor) => {
        const createdProfessor = await professorsService.newProfessor(professor);
        createdProfessor.label = professor.name + " " + professor.lastName;
        createdProfessor.value = professor.id;
        changeAlertStatusAndMessage(true, 'success', 'El profesor fue agregado exitosamente!')
        setProfessors(current => [...current, createdProfessor]);
        return createdProfessor;
    }

    const newClazz = async (clazz) => {
        const createdClazz = await clazzesService.newClazz(clazz);
        changeAlertStatusAndMessage(true, 'success', 'La clase fue creada exitosamente!');
        createdClazz.label = createdClazz.title;
        createdClazz.value = createdClazz.id;
        setClazzes(current => [...current, createdClazz]);
        return createdClazz;
    }

    const newUser = async (user) => {
        const createdUser = await userService.createUser(user);
        changeAlertStatusAndMessage(true, 'success', 'La clase fue creada exitosamente!');
        setUsers(current => [...current, createdUser]);
        return createdUser;
    }

    const deleteStudent = async studentId => {
        await studentsService.deleteStudent(studentId);
        changeAlertStatusAndMessage(true, 'success', 'El estudiante fue borrado exitosamente!')
        setStudents(current => current.filter(student => student.id !== studentId));
    }

    const deleteProfessor = async professorId => {
        await professorsService.deleteProfessor(professorId);
        changeAlertStatusAndMessage(true, 'success', 'El profesor fue borrado exitosamente!')
        setProfessors(current => current.filter(prof => prof.id !== professorId));
    }

    const editStudent = async (studentId, student) => {
        const editedStudent = await studentsService.editStudent(studentId, student);
        changeAlertStatusAndMessage(true, 'success', 'El estudiante fue editado exitosamente!')
        setStudents(current => current.map(s => s.id === studentId ? merge(s, editedStudent) : s));
    }

    const editCollege = async (collegeId, college) => {
        const editedCollege = await collegesService.editCollege(collegeId, college);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue editado exitosamente!')
        setColleges(current => current.map(c => c.id === collegeId ? merge(c, editedCollege) : c));
    }
    
    const editClazz = async (clazzId, clazz) => {
        await clazzesService.editclazz(clazzId, clazz);
        changeAlertStatusAndMessage(true, 'success', 'La clase fue editada exitosamente!')
        //Comentado porque despues hace un fetch con force
        //setClazzes(current => current.map(s => s.id === clazzId ? merge(s, clazz) : s));
    }

    const newStudent = async student => {
        const createdStudent = await studentsService.newStudent(student);
        createdStudent.label = createdStudent.name + ' ' + createdStudent.lastName;
        createdStudent.value = createdStudent.id;
        changeAlertStatusAndMessage(true, 'success', 'El estudiante fue agregado exitosamente!')
        setStudents(current => [...current, createdStudent]);
        return createdStudent;
    }

    const newStudents = students => {
        const observable = studentsService.newStudents(students);
        observable.subscribe({
            complete() {
                students.forEach(createdStudent => {
                    createdStudent.label = createdStudent.name + ' ' + createdStudent.lastName;
                    createdStudent.value = createdStudent.id;
                })
                changeAlertStatusAndMessage(true, 'success', 'Los estudiantes se importaron exitosamente!')
                setStudents(current => [...current, ...students]);
            }
        })
        return observable;
    }

    const newSubscriptionClasses = payments => {
        payments.forEach(p => {
            p.verified = true;
            p.type = CASH_PAYMENT_TYPE;
        });
        const observable = paymentsService.newPayments(payments);
        observable.subscribe({
            complete() {
                changeAlertStatusAndMessage(true, 'success', 'Los pagos se importaron exitosamente!')
                setPayments(current => [...current, ...payments]);
            }
        })
        return observable;
    }

    const deleteCourse = async courseId => {
        await coursesService.deleteCourse(courseId);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue borrado exitosamente!')
    }

    const deleteClazz = async clazzId => {
        await clazzesService.deleteClazz(clazzId);
        changeAlertStatusAndMessage(true, 'success', 'La clase fue borrada exitosamente!')
        setClazzes(current => current.filter(clazz => clazz.id !== clazzId));
    }

    const newCourse = async course => {
        const createdCourse = await coursesService.newCourse(course);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue creado exitosamente!');
        createdCourse.label = createdCourse.title;
        createdCourse.value = createdCourse.id;
        return createdCourse;
    }

    const editCourse = async (courseId, course) => {
        const editedCourse = await coursesService.editCourse(courseId, course);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue editado exitosamente!');
        editedCourse.periods = course.professors;
        return editedCourse;
    }

    const editProfessor = async (professorId, professor) => {
        const editedProfessor = await professorsService.editProfessor(professorId, professor);
        changeAlertStatusAndMessage(true, 'success', 'El profesor fue editado exitosamente!');
        setProfessors(current => current.map(s => s.id === professorId ? merge(s, professor) : s));
        return editedProfessor;
    }

    const addStudent = async (courseId, studentsIds) => {
        const editedCourse = await coursesService.addStudent(courseId, studentsIds);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue editado exitosamente!')
        editedCourse.label = editedCourse.name;
        editedCourse.value = editedCourse.id;
        return editedCourse;
    }

    const editTask = async task => {
        await tasksService.editTask(task);
        changeAlertStatusAndMessage(true, 'success', 'La tarea fue editada exitosamente!')
        setTasks(current => current.map(t => t.id === task.id ? task : t));
    }

    const deleteTask = async taskId => {
        await tasksService.deleteTask(taskId);
        changeAlertStatusAndMessage(true, 'success', 'La tarea fue borrada exitosamente!')
        setTasks(current => current.filter(task => task.id !== taskId));
    }

    const createTask = async task => {
        const createdTask = await tasksService.createTask(task);
        changeAlertStatusAndMessage(true, 'success', 'La tarea fue creada exitosamente!')
        setTasks(current => [...current, createdTask]);
        return createdTask;
    }

    const associateTask = async (courseId, task) => {
        const createdTask = await coursesService.associateTask(courseId, task);
        changeAlertStatusAndMessage(true, 'success', 'La tarea fue asociada exitosamente!')
        return createdTask;
    }

    const deleteCourseTask = async (taskId) => {
        await coursesService.deleteCourseTask(taskId);
        changeAlertStatusAndMessage(true, 'success', 'La tarea fue eliminada exitosamente!');
    }

    const changeAlertStatusAndMessage = (activeAlert, status, message) => {
        setAlertMessage(message);
        setIsAlertActive(activeAlert);
        setAlertStatus(status);
    }

    const changeTaskStatus = async (taskId, studentId, taskStatus) => {
        setIsLoadingCourses(false)
        await coursesService.changeTaskStatus(taskId, studentId, taskStatus);
        setIsLoadingCourses(true)
        changeAlertStatusAndMessage(true, 'success', 'El estado de la tarea fue editado exitosamente!')
    }

    const getPendingPayments = async () => {
        const response = await studentsService.getPendingPayments();
        //Transforma el json de cursos en array
        Object.keys(response.students).forEach(studentId => {
            response.students[studentId].courses = Object.keys(response.students[studentId].courses)
                .map(courseId => response.students[studentId].courses[courseId]);
        })
        return response;
    };

    const getPendingPaymentsByCourseFromStudent = student => {
        const courses = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth()+1;
        const now = new Date().toISOString();
        student.courses.forEach(course => {
            let memberSince = student.courseStudents?.find(cs => cs.courseId == course.id)?.createdAt || now;
            memberSince = new Date(memberSince);
            const periods = {};
            if (course.startAt == null)
                course.startAt = now;
            if (course.endAt == null)
                course.endAt = now;
            series(course.startAt, course.endAt)
            .forEach(date => {
                const year = date.getFullYear();
                const month = date.getMonth() +1;
                if (!(year in periods)) {
                    periods[year] = {};
                    for (let i = 1; i <= 12; i++) {
                        periods[year][i] = false;
                    }
                }
                // Si todavia no se pago el curso, se marca como pendiente
                if ((year > currentYear) || (month > currentMonth && year == currentYear)) {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.PENDING
                    };
                } else { // Si ya paso el mes, se marca como no pagado (mas adelante se verifica si esta al dia)
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID
                    };
                }
                // Si el estudiante no asistio a la clase, se marca como no asistido
                if (!((year > memberSince.getFullYear()) || (month > (memberSince.getMonth()) && year == memberSince.getFullYear()))) {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN
                    };
                }
                // Si el curso es circular y no se pago, se marca como no pagado circular
                if (course.isCircular && periods[year][month].condition == STUDENT_MONTHS_CONDITIONS.NOT_PAID) {
                    periods[year][month].condition = STUDENT_MONTHS_CONDITIONS.CIRCULAR_NOT_PAID;
                }

            });
            if (course.isCircular) {
                const circularCoursePaid = student.payments.some(payment => payment.courseId == course.id)
                courses.push({ ...course, memberSince, periods, isUpToDate: circularCoursePaid });
                return;
            }
            student.payments.forEach(payment => {
                if (payment.courseId != course.id)
                    return
                const operativeResult = new Date(payment.operativeResult);
                const year = operativeResult.getFullYear();
                const month = operativeResult.getMonth() +1;
                if (year in periods && month in periods[year]) {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.PAID,
                        payment,
                    };
                }
            });
            let years = Object.keys(periods);
            let isUpToDate = true;
            while (isUpToDate && years.length > 0) {
                const y = years.pop();
                let m = 1;
                while (isUpToDate && m <= 12) {
                    if (periods[y][m].condition === STUDENT_MONTHS_CONDITIONS.NOT_PAID) {
                        isUpToDate = false;
                    }
                    m++;
                }
            }
            courses.push({ ...course, memberSince, periods, isUpToDate })
        });
        return courses;        
    }

    const updateInscriptionDate = async (studentId, courseId, inscriptionDate) => {
        await coursesService.updateInscriptionDate(studentId, courseId, inscriptionDate);
        const copyStudents = JSON.parse(JSON.stringify(students));
        copyStudents.forEach(st => {
            if (st.id == studentId) 
                st.courseStudents.forEach(cs => {
                    if (cs.courseId == courseId) 
                        cs.createdAt = inscriptionDate;
                });
        });
        setStudents(copyStudents);
        changeAlertStatusAndMessage(true, 'success', 'Fecha actualizada')
    }

    const newService = async service => {
        const createdService = await templatesService.newService(service);
        changeAlertStatusAndMessage(true, 'success', 'El servicio fue creado exitosamente!')
        createdService.label = createdService.note;
        setServices(current => [...current, createdService]);
        return createdService;
    }

    const editService = async (service, id) => {
        const editedService = await templatesService.updateService(id, service);
        changeAlertStatusAndMessage(true, 'success', 'El servicio fue editado exitosamente!')
        editedService.label = editedService.note;
        setServices(current => current.map(t => t.id === id ? editedService : t));
        return editedService;
    }

    const deleteService = async (serviceId) => {
        await templatesService.deleteService(serviceId);
        changeAlertStatusAndMessage(true, 'success', 'El servicio fue borrado exitosamente!')
        setServices(current => current.filter(s => s.id !== serviceId));
    }

    const deleteCategory = async (categoryId) => {
        await categoriesService.deleteCategory(categoryId);
        changeAlertStatusAndMessage(true, 'success', 'La categoria fue borrada exitosamente!')
        setCategories(current => current.filter(c => c.id !== categoryId));
    }
    
    const editCategory = async (categoryId, categoryData) => {
        const editedCategory = await categoriesService.editCategory(categoryId, categoryData);
        editedCategory.label = editedCategory.title;
        editedCategory.value = editedCategory.id;
        changeAlertStatusAndMessage(true, 'success', 'La categoria fue editada exitosamente!')
        setCategories(current => current.map(c => c.id === categoryId ? editedCategory : c));
    }
    
    const newCategory = async categoryData => {
        const createdCategory = await categoriesService.newCategory(categoryData);
        createdCategory.label = createdCategory.title;
        createdCategory.value = createdCategory.id;
        changeAlertStatusAndMessage(true, 'success', 'La categoria fue creada exitosamente!')
        setCategories(current => [...current, createdCategory]);
    }

    const verifyClazz = async clazz => {
        clazz.paymentsVerified = true;
        await clazzesService.editclazz(clazz.id, clazz);
        changeAlertStatusAndMessage(true, 'success', 'La clase fue verificada exitosamente!')
        setClazzes(current => current.map(c => c.id === clazz.id ? clazz : c));
        setPayments(current => current.map(payment => payment.clazzId === clazz.id ? ({ ...payment, verified: true }) : payment));
    }

    const calcProfessorsPayments = async (from, to, professorId, courseId) => {
        let data = await coursesService.calcProfessorsPayments(from, to, professorId, courseId);
        data.forEach(d => {
            d.professors = d.professors.filter(professor => "result" in professor);
            d.professorsNames = d.professors.map(p => p.name);
            d.professors.forEach(professor => {
                professor.result.payments.forEach(payment => {
                    //if (payment.studentId) TODO: ver esto si rompe algo
                        //payment.student = getStudentById(payment.studentId);
                    if (payment.userId)
                        payment.user = getUserById(payment.userId);
                });
            });
        });
        return data;
    }

    const updatePayment = async (data, paymentId) => {
        await paymentsService.updatePayment(data, paymentId);
    }

    const suspendStudentFromCourse = async (studentId, courseId, from, to) => {
        setIsLoadingCourses(true)
        await studentsService.suspendStudentFromCourse(studentId, courseId, from, to)
        setIsLoadingCourses(false)
    }

    const finishSuspend = async (studentId, courseId, from) => {
        setIsLoadingCourses(true)
        const now = new Date()
        const year = now.getFullYear()
        let month = now.getMonth()+1
        month = month < 10 ? "0" + month : month
        const to = `${year}-${month}`
        await studentsService.suspendStudentFromCourse(studentId, courseId, from, to)
        setIsLoadingCourses(false)
    }

    const deleteSuspension = async (studentId, courseId, from, to) => {
        setIsLoadingCourses(true)
        await studentsService.deleteSuspension(studentId, courseId, from, to)
        setIsLoadingCourses(false)
    }

    const getSecretaryPaymentDetail = async () => {
        if (lastSecretaryPayment) return lastSecretaryPayment;
        const last = await paymentsService.getLastSecretaryPayment();
        setLastSecretaryPayment(last);
        return last;
    }


    return (
        <Context.Provider value={{
            getAgendaLocations,
            getAgendaCashValues,
            students,
            payments,
            services,
            getClazzes,
            suspendStudentFromCourse,
            deleteSuspension,
            getSecretaryPaymentDetail,
            finishSuspend,
            isLoadingColleges,
            isLoadingCourses,
            isLoadingPayments,
            isLoadingProfessors,
            isLoadingStudents,
            isLoadingTasks,
            isAlertActive,
            alertMessage,
            alertStatus,
            setUser,
            informPayment,
            verifyPayment,
            newSubscriptionClasses,
            deletePayment,
            deleteCollege,
            addCoursesToCollege,
            newCollege,
            newClazz,
            generateReceipt,
            newUser,
            deleteUser,
            deleteStudent,
            editStudent,
            newStudent,
            newStudents,
            deleteCourse,
            newCourse,
            editCourse,
            updateInscriptionDate,
            addStudent,
            editTask,
            deleteTask,
            createTask,
            associateTask,
            changeTaskStatus,
            newService,
            editUser,
            editService,
            deleteService,
            getCourseDetailsById,
            editClazz,
            deleteClazz,
            deleteCategory,
            editCategory,
            newCategory,
            verifyClazz,
            getStudentsByCourse,
            getCategories,
            isLoadingCategories: isLoadingCategories.value,
            getProfessorDetailsById,
            getStudentDetailsById,
            deleteCourseTask,
            getUserById,
            getProfessors,
            getTasks,
            getPendingPaymentsByCourseFromStudent,
            getPendingProfessorPayments,
            newProfessorPayment,
            editPayment,
            newProfessor,
            deleteProfessor,
            editProfessor,
            editCollege,
            users,
            changeAlertStatusAndMessage,
            calcProfessorsPayments,
            updatePayment,
            getColleges,
            getStudentPayments,
            getServices,
            getItems,
            user,
            getPendingPayments,
            splitPayment,
            notifications,
            removeNotification,
            clearNotifications,
        }}>
            <GoogleApiProvider clientId={user?.googleDriveCredentials?.clientId}>
                <GoogleOAuthProvider clientId={user?.googleDriveCredentials?.clientId}>
                    {children}
                </GoogleOAuthProvider>
            </GoogleApiProvider>
        </Context.Provider>
    );
}