import React, { createContext, useEffect, useState } from "react";
import studentsService from "../services/studentsService";
import coursesService from "../services/coursesService";
import tasksService from "../services/tasksService";
import clazzesService from "../services/clazzesService";
import collegesService from "../services/collegesService";
import paymentsService from "../services/paymentsService";
import templatesService from "../services/templatesService";
import categoriesService from "../services/categoriesService";
import userService from "../services/userService";

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
    const [templates, setTemplates] = useState([]);
    const [users, setUsers] = useState([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [payments, setPayments] = useState([]);
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

    useEffect(() => {
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
            coursesList.forEach(course => {
                course.label = course.title;
                course.value = course.id;
            });
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
            setPayments(paymentsList);
            setIsLoadingPayments(false);
        }
        const getTemplates = async () => {
            const templates = await templatesService.getTemplates();
            templates.forEach(template => {
                template.label = template.title;
                template.value = template.id;
            });
            setTemplates(templates);
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
        getUsers();
        getStudents();
        getCourses();
        getTasks();
        getColleges();
        getPayments();
        getTemplates();
        getClazzes();
        getCategories();
    }, [user]);

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
        for (let key in item1)
            item1[key] = item2[key];
        return item1;
    }

    const getCourseById = courseId => courses.find(course => course.id === courseId);
    const getStudentById = studentId => students.find(student => student.id === studentId);
    const getHeadquarterById = headquarterId => colleges.find(headquarter => headquarter.id === headquarterId);
    const getItemById = itemId => categories.find(category => category.items.find(item => item.id === itemId)).items.find(item => item.id === itemId);

    const informPayment = async payment => {
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
    };

    const deletePayment = async (id) => {
        await paymentsService.deletePayment(id);
        setPayments(current => current.filter(p => p.id !== id));
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

    const editStudent = async (studentId, student) => {
        await studentsService.editStudent(studentId, student);
        changeAlertStatusAndMessage(true, 'success', 'El estudiante fue editado exitosamente!')
        setStudents(current => current.map(s => s.id === studentId ? merge(s, student) : s));
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
        changeAlertStatusAndMessage(true, 'success', 'El curso fue creado exitosamente!')
        setCourses(current => [...current, createdCourse]);
        return createdCourse;
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
        await coursesService.changeTaskStatus(taskId, studentId, taskStatus);
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

    const getTemplate = async templateId => {
        console.log("getTemplate ", templateId);
        const localTemplate = templates.find(t => t.id === templateId);
        console.log(localTemplate);
        if (localTemplate && "content" in localTemplate)
            return localTemplate;
        const template = await templatesService.getTemplate(templateId);
        template.label = template.title;
        template.value = template.id;
        setTemplates(current => current.map(t => t.id === templateId ? template : t));
        return template;
    }

    const newTemplate = async template => {
        const createdTemplate = await templatesService.newTemplate(template);
        changeAlertStatusAndMessage(true, 'success', 'El template fue creado exitosamente!')
        createdTemplate.label = createdTemplate.title;
        createdTemplate.value = createdTemplate.id;
        setTemplates(current => [...current, createdTemplate]);
        return createdTemplate;
    }

    const editTemplate = async (template, id) => {
        const editedTemplate = await templatesService.updateTemplate(id, template);
        changeAlertStatusAndMessage(true, 'success', 'El template fue editado exitosamente!')
        editedTemplate.label = editedTemplate.title;
        editedTemplate.value = editedTemplate.id;
        setTemplates(current => current.map(t => t.id === id ? editedTemplate : t));
        return editedTemplate;
    }

    const deleteCategory = async (categoryId) => {
        await categoriesService.deleteCategory(categoryId);
        changeAlertStatusAndMessage(true, 'success', 'La categoria fue borrada exitosamente!')
        setCategories(current => current.filter(c => c.id !== categoryId));
    }
    
    const editCategory = async (categoryId, categoryData) => {
        const editedCategory = await categoriesService.editCategory(categoryId, categoryData);
        changeAlertStatusAndMessage(true, 'success', 'La categoria fue editada exitosamente!')
        setCategories(current => current.map(c => c.id === categoryId ? editedCategory : c));
    }
    
    const newCategory = async categoryData => {
        const createdCategory = await categoriesService.newCategory(categoryData);
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

    return (
        <Context.Provider value={{
            colleges,
            courses,
            students,
            tasks,
            payments,
            templates,
            clazzes,
            categories,
            items,
            isLoadingColleges,
            isLoadingCourses,
            isLoadingPayments,
            isLoadingStudents,
            isLoadingTasks,
            isLoadingTemplates,
            isLoadingCategories,
            isAlertActive,
            alertMessage,
            alertStatus,
            setUser,
            informPayment,
            deletePayment,
            deleteCollege,
            addCoursesToCollege,
            newCollege,
            newClazz,
            newUser,
            deleteStudent,
            editStudent,
            newStudent,
            deleteCourse,
            newCourse,
            addStudent,
            editTask,
            deleteTask,
            createTask,
            associateTask,
            changeTaskStatus,
            newTemplate,
            getTemplate,
            editTemplate,
            editClazz,
            deleteClazz,
            deleteCategory,
            editCategory,
            newCategory,
            verifyClazz,
            users,
            changeAlertStatusAndMessage,
        }}>{children}</Context.Provider>
    );
}