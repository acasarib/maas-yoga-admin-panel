import React, { createContext, useEffect, useState } from "react";
import studentsService from "../services/studentsService";
import coursesService from "../services/coursesService";
import tasksService from "../services/tasksService";
import clazzesService from "../services/clazzesService";
import collegesService from "../services/collegesService";
import paymentsService from "../services/paymentsService";
import professorsService from "../services/professorsService";
import templatesService from "../services/templatesService";
import categoriesService from "../services/categoriesService";
import userService from "../services/userService";
import { APP_VERSION, CASH_PAYMENT_TYPE, STUDENT_MONTHS_CONDITIONS } from "../constants";
import logsService from "../services/logsService";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleApiProvider } from 'react-gapi'
import agendaService from "../services/agendaService";
import { series } from "../utils";

export const Context = createContext();

export const Provider = ({ children }) => {
    const [colleges, setColleges] = useState([]);
    const [isLoadingColleges, setIsLoadingColleges] = useState(true);
    const [courses, setCourses] = useState([]);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);
    const [students, setStudents] = useState([]);
    const [isLoadingStudents, setIsLoadingStudents] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [services, setServices] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [payments, setPayments] = useState([]);
    const [secretaryPayments, setSecretaryPayments] = useState([]);
    const [alreadyAddedSecretaryPayments, setAlreadyAddedSecretaryPayments] = useState(false);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [clazzes, setClazzes] = useState([]);
    const [isLoadingClazzes, setIsLoadingClazzes] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [items, setItems] = useState([]);
    const [user, setUser] = useState(null);
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertStatus, setAlertStatus] = useState('');
    const [professors, setProfessors] = useState([]);
    const [isLoadingProfessors, setIsLoadingProfessors] = useState(true);
    const [logs, setLogs] = useState([]);
    const [logsInit, setLogsInit] = useState(false);
    const [agendaLocations, setAgendaLocations] = useState([]);

    useEffect(() => {
        console.log("App running version=" + APP_VERSION);
        if (user === null) return;
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name + ' ' + student.lastName;
                student.value = student.id;
            });
            setStudents(studentsList);
            setIsLoadingStudents(false);
        }
        const getCourses = async () => {
            const coursesList = await coursesService.getCourses();
            setCourses(coursesList);
            setIsLoadingCourses(false);
        }
        const getTasks = async () => {
            const tasksList = await tasksService.getTasks();
            setTasks(tasksList);
            setIsLoadingTasks(false);
        }
        const getColleges = async () => {
            const collegesList = await collegesService.getColleges();
            collegesList.forEach(college => {
                college.label = college.name;
                college.value = college.id;
            });
            setColleges(collegesList);
            setIsLoadingColleges(false);
        }
        const getPayments = async () => {
            const paymentsList = await paymentsService.getAllPayments();
            const sortedList = paymentsList.sort((a, b) => {
                const dateA = new Date(a.at);
                const dateB = new Date(b.at);
                return dateB - dateA;
            });
            setPayments(sortedList);
            setIsLoadingPayments(false);
        }
        const getServices = async () => {
            const services = await templatesService.getServices();
            services.forEach(template => {
                template.label = template.note;
                template.value = template.value;
            });
            setServices(services);
        }
        const getClazzes = async () => {
            const clazzes = await clazzesService.getClazzes();
            clazzes.forEach(clazz => {
                clazz.label = clazz.title;
                clazz.value = clazz.id;
            });
            setClazzes(clazzes);
        }
        const getCategories = async () => {
            const categories = await categoriesService.getCategories();
            categories.forEach(category => {
                category.label = category.title;
                category.value = category.id;
                category.items.forEach(item => {
                    item.label = item.title;
                    item.value = item.id;
                });
            });
            setCategories(categories);
        }
        const getUsers = async () => {
            try {
              const usersList = await userService.getUsers();
              setUsers(usersList);
            }catch {
              changeAlertStatusAndMessage(true, 'error', 'No fue posible obtener los usuarios... Por favor recarge la página.');
            }
        }
        const getProffesors = async () => {
            const pfrs = await professorsService.getProffesors();
            pfrs.forEach(professor => {
                professor.label = professor.name + " " + professor.lastName;
                professor.value = professor.id;
            })
            setProfessors(pfrs);
            setIsLoadingProfessors(false);
        }
        const getAgendaLocations = async () => {
            const locations = await agendaService.getLocations();
            locations.forEach(location => {
                location.label = location.nombre;
                location.value = location.id;
            });
            setAgendaLocations(locations);
        }
        
        getUsers();
        getStudents();
        getCourses();
        getTasks();
        getColleges();
        getPayments();
        getServices();
        getClazzes();
        getCategories();
        getProffesors();
        getAgendaLocations();
    }, [user]);

    const addSecretaryPaymentsToPayments = async () => {
        const secretaryPayments = await paymentsService.getSecretaryPayments();
        setSecretaryPayments(secretaryPayments);
        setPayments(prev => prev.map(payment => {
            if ("secretaryPaymentId" in payment && payment.secretaryPaymentId != null) {
                payment.secretaryPayment = secretaryPayments.find(sp => sp.id == payment.secretaryPaymentId)
            }
            return payment;
        }))
    }

    useEffect(() => {
        if (isLoadingPayments || alreadyAddedSecretaryPayments) return
        addSecretaryPaymentsToPayments()
        setAlreadyAddedSecretaryPayments(true)
    }, [payments, isLoadingPayments, alreadyAddedSecretaryPayments])
    

    const getAgendaCashValues = async (year, month, location) => {
        return agendaService.getCash(year, month, location);
    }

    useEffect(() => {
        const formatedItems = [];
        categories.forEach(category => category.items.forEach(item => {
            item.categoryTitle = category.title;
            item.value = item.id;
            item.label = item.title;
            formatedItems.push(item);
        }));
        setItems(formatedItems);
    }, [categories]);

    const merge = (item1, item2) => {
        for (let key in item1) {
            if (key in item2)
                item1[key] = item2[key];
        }
        return JSON.parse(JSON.stringify(item1));
    }

    const getCourseById = courseId => courses.find(course => course.id == courseId);
    const getStudentById = studentId => students.find(student => student.id == studentId);
    const getHeadquarterById = headquarterId => colleges.find(headquarter => headquarter.id == headquarterId);
    const getItemById = itemId => categories.find(category => category.items.find(item => item.id == itemId)).items.find(item => item.id == itemId);
    const getUserById = userId => users.find(user => user.id == userId);
    const getSecretaryPaymentById = spId => secretaryPayments.find(sp => sp.id == spId);
    const getProfessorById = professorId => professors.find(professor => professor.id == professorId);

    const getProfessorDetailsById = async (professorId, force = false) => {
        const localProfessor = getProfessorById(professorId);
        if (localProfessor) {
            if (force === false && ("courses" in localProfessor)) {
                return localProfessor;
            }
            const professor = await professorsService.getProfessor(professorId);
            setProfessors(prev => prev.map(p => {
                if (p.id === professorId) {
                    return professor;
                } else {
                    return p;
                }
            }))
            return professor;
        } else {
            const professor = await professorsService.getProfessor(professorId);
            setProfessors(prev => [...professors, professor]);
            return professor;
        }
    }

    const getCourseDetailsById = async (courseId, force = false) => {
        const localCourse = getCourseById(courseId);
        if (localCourse) {
            if (force === false) {
                return localCourse;
            }
            const course = await coursesService.getCourse(courseId);
            setCourses(prev => prev.map(c => {
                if (c.id === courseId) {
                    return course;
                } else {
                    return c;
                }
            }))
            return course;
        } else {
            const course = await coursesService.getCourse(courseId);
            setProfessors([...courses, course]);
            return course;
        }
    }

    const getStudentsByCourse = (courseId) => {
        return studentsService.getStudentsByCourse(courseId);
    }

    const getStudentDetailsById = async studentId => {
        const localStudent = getStudentById(studentId);
        if (localStudent) {
            if ("courseTasks" in localStudent) {
                return localStudent;
            }
            const student = await studentsService.getStudent(studentId);
            setStudents(prev => prev.map(s => {
                if (s.id === studentId) {
                    return student;
                } else {
                    return s;
                }
            }))
            return student;
        } else {
            const student = await studentsService.getStudent(studentId);
            setStudents(prev => [...students, student]);
            return student;
        }
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

    const informPayment = async payment => {
        try {
            const createdPayment = await paymentsService.informPayment(payment);
            changeAlertStatusAndMessage(true, 'success', 'El movimiento fue informado exitosamente!')
            createdPayment.user = user;
            if (createdPayment.courseId !== null)
                createdPayment.course = getCourseById(createdPayment.courseId);
            if (createdPayment.studentId)
                createdPayment.student = getStudentById(createdPayment.studentId);
            if (createdPayment.headquarterId)
                createdPayment.headquarter = getHeadquarterById(createdPayment.headquarterId);
            if (createdPayment.itemId)
                createdPayment.item = getItemById(createdPayment.itemId);
            setPayments(current => [...current, createdPayment]);
            return createdPayment;
        } catch(e) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser informado... Por favor inténtelo nuevamente.');
        }
    };

    const editPayment = async payment => {
        try {
            const editedPayment = await paymentsService.editPayment(payment);
            changeAlertStatusAndMessage(true, 'success', 'El movimiento fue editado exitosamente!')
            editedPayment.user = user;
            if (editedPayment.courseId !== null)
                editedPayment.course = getCourseById(editedPayment.courseId);
            if (editedPayment.studentId)
                editedPayment.student = getStudentById(editedPayment.studentId);
            if (editedPayment.headquarterId)
                editedPayment.headquarter = getHeadquarterById(editedPayment.headquarterId);
            if (editedPayment.itemId)
                editedPayment.item = getItemById(editedPayment.itemId);
            console.log(editedPayment);
            setPayments(current => current.map(p => p.id === payment.id ? merge(p, editedPayment) : p));
        } catch(e) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser editado... Por favor inténtelo nuevamente.');
        }
    };

    const getLogs = async () => {
        if (!logsInit) {
            const l = await logsService.getAll();
            l.forEach(log => {
                log.user = getUserById(log.userId);
            })
            setLogs(l);
            return l;
        } else {
            return logs;
        }
    }

    const verifyPayment = async (paymentId) => {
        const veryfiedPayment = await paymentsService.verifyPayment(paymentId);
        changeAlertStatusAndMessage(true, 'success', 'El pago fue verificado exitosamente!');
        setPayments(current => current.map(p => ({ ...p, verified: true, user: users.find(u => u.id === p.userId) })));
        return veryfiedPayment;
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
        setColleges(current => [...current, createdCollege]);
        return createdCollege;
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
        setClazzes(current => current.map(s => s.id === clazzId ? merge(s, clazz) : s));
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
        setCourses(current => current.filter(course => course.id !== courseId));
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
        setCourses(current => [...current, createdCourse]);
        return createdCourse;
    }

    const editCourse = async (courseId, course) => {
        const editedCourse = await coursesService.editCourse(courseId, course);
        changeAlertStatusAndMessage(true, 'success', 'El curso fue editado exitosamente!');
        editedCourse.periods = course.professors;
        setCourses(current => current.map(s => s.id === courseId ? merge(s, editedCourse) : s));
        console.log(courses)
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
        setCourses(current => current.map(course => course.id === courseId ? editedCourse : course));
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
        setCourses(current => current.map(course => {
            if (course.id === courseId) {
                createdTask.students = course.students;
                course.courseTasks.push(createdTask);
            }
            return course;
        }));
    }

    const changeAlertStatusAndMessage = (activeAlert, status, message) => {
        setAlertMessage(message);
        setIsAlertActive(activeAlert);
        setAlertStatus(status);
    }

    const changeTaskStatus = async (courseId, taskId, studentId, taskStatus) => {
        setIsLoadingCourses(false)
        await coursesService.changeTaskStatus(taskId, studentId, taskStatus);
        setIsLoadingCourses(true)
        changeAlertStatusAndMessage(true, 'success', 'El estado de la tarea fue editado exitosamente!')
        setCourses(current => current.map(course => {
            if (course.id === courseId) {
                course.courseTasks.map(courseTask => {
                    if (courseTask.id === taskId) {
                        courseTask.students.map(courseTaskStudent => {
                            if (courseTaskStudent.id === studentId) {
                                courseTaskStudent.studentCourseTask.completed = taskStatus;
                            }
                            return courseTaskStudent;
                        });
                    }
                    return courseTask;
                });
            }
            return course;
        }));
    }

    const getPendingPayments = async () => {
        const response = { students: {} };
        const data = await studentsService.getPendingPayments();
        Object.keys(data.students).forEach(studentId => {
            response.students[studentId] = getStudentById(studentId);
            response.students[studentId].courses = [];
            const studentCoursesIds = Object.keys(data.students[studentId].courses);
            studentCoursesIds.forEach(courseId => {
                const course = getCourseById(courseId);
                const { memberSince, periods } = data.students[studentId].courses[courseId];
                course.periods = periods;
                course.memberSince = memberSince;
                response.students[studentId].courses.push(course);
            });
        });
        return response;
    };

    const getPendingPaymentsByCourseFromStudent = student => {
        const courses = [];
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth()+1;
        student.courses.forEach(course => {
            let memberSince = student.courseStudents.find(cs => cs.courseId == course.id).createdAt;
            memberSince = new Date(memberSince);
            const periods = {};
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
                if ((year > currentYear) || (month > currentMonth && year == currentYear)) {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.PENDING
                    };
                } else {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.NOT_PAID
                    };
                }
                if (!((year > memberSince.getFullYear()) || (month > (memberSince.getMonth()) && year == memberSince.getFullYear()))) {
                    periods[year][month] = {
                        condition: STUDENT_MONTHS_CONDITIONS.NOT_TAKEN
                    };
                }
            });
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

    const getService = async serviceId => {
        const localService = services.find(t => t.id === serviceId);;
        if (localService && "content" in localService)
            return localService;
        const service = await templatesService.getTemplate(serviceId);
        service.label = service.title;
        service.value = service.id;
        setServices(current => current.map(t => t.id === serviceId ? service : t));
        return service;
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
                    if (payment.courseId !== null)
                        payment.course = getCourseById(payment.courseId);
                    if (payment.studentId)
                        payment.student = getStudentById(payment.studentId);
                    if (payment.headquarterId)
                        payment.headquarter = getHeadquarterById(payment.headquarterId);
                    if (payment.itemId)
                        payment.item = getItemById(payment.itemId);
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

    const getSecretaryPaymentDetail = () => {
        return secretaryPayments.reduce((max, current) => {
            if (current.createdAt > max.createdAt) {
              return current;
            } else {
              return max;
            }
        }, secretaryPayments[0]);
    }


    return (
        <Context.Provider value={{
            agendaLocations,
            getAgendaCashValues,
            colleges,
            courses,
            students,
            tasks,
            payments,
            services,
            clazzes,
            categories,
            suspendStudentFromCourse,
            deleteSuspension,
            getSecretaryPaymentDetail,
            finishSuspend,
            items,
            isLoadingColleges,
            isLoadingCourses,
            isLoadingPayments,
            isLoadingProfessors,
            isLoadingStudents,
            isLoadingTasks,
            isLoadingTemplates,
            isLoadingCategories,
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
            newUser,
            deleteUser,
            getSecretaryPaymentById,
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
            getService,
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
            getProfessorDetailsById,
            getStudentDetailsById,
            getUserById,
            getPendingPaymentsByCourseFromStudent,
            newProfessorPayment,
            editPayment,
            professors,
            newProfessor,
            deleteProfessor,
            editProfessor,
            editCollege,
            users,
            changeAlertStatusAndMessage,
            calcProfessorsPayments,
            updatePayment,
            getHeadquarterById,
            getItemById,
            getLogs,
            getProfessorById,
            getCourseById,
            user,
            getPendingPayments,
        }}>
            <GoogleApiProvider clientId={user?.googleDriveCredentials?.clientId}>
                <GoogleOAuthProvider clientId={user?.googleDriveCredentials?.clientId}>
                    {children}
                </GoogleOAuthProvider>
            </GoogleApiProvider>
        </Context.Provider>
    );
}