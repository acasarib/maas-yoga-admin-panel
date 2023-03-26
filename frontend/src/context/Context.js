import React, { createContext, useEffect, useState } from "react";
import studentsService from "../services/studentsService";
import coursesService from "../services/coursesService";
import tasksService from "../services/tasksService";
import collegesService from "../services/collegesService";
import paymentsService from "../services/paymentsService";
import templatesService from "../services/templatesService";

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
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
    const [payments, setPayments] = useState([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        if (user === null) return;
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name;
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
        getStudents();
        getCourses();
        getTasks();
        getColleges();
        getPayments();
        getTemplates();
    }, [user]);

    const merge = (item1, item2) => {
        for (let key in item1)
            item1[key] = item2[key];
        return item1;
    }

    const getCourseById = courseId => courses.find(course => course.id === courseId);
    const getStudentById = studentId => students.find(student => student.id === studentId);
    const getHeadquarterById = headquarterId => colleges.find(headquarter => headquarter.id === headquarterId);

    const informPayment = async payment => {
        const createdPayment = await paymentsService.informPayment(payment);
        createdPayment.user = user;
        if (createdPayment.courseId !== null)
            createdPayment.course = getCourseById(createdPayment.courseId);
        if (createdPayment.studentId)
            createdPayment.student = getStudentById(createdPayment.studentId);
        if (createdPayment.headquarterId)
            createdPayment.headquarter = getHeadquarterById(createdPayment.headquarterId);
        setPayments(current => [...current, createdPayment]);
        return createdPayment;
    };

    const deleteCollege = async collegeId => {
        await collegesService.deleteCollege(collegeId);
        setColleges(current => current.filter(college => college.id !== collegeId));
    };

    const addCoursesToCollege = async (collegeId, coursesIds) => {
        const collegeEdited = await collegesService.addCourses(collegeId, coursesIds);
        collegeEdited.label = collegeEdited.title;
        collegeEdited.value = collegeEdited.id;
        setColleges(current => current.map(college => college.id === collegeId ? collegeEdited : college));
        return collegeEdited;
    };

    const newCollege = async (college) => {
        const createdCollege = await collegesService.newCollege(college);
        createdCollege.label = createdCollege.title;
        createdCollege.value = createdCollege.id;
        setColleges(current => [...current, createdCollege]);
        return createdCollege;
    }

    const deleteStudent = async studentId => {
        await studentsService.deleteStudent(studentId);
        setStudents(current => current.filter(student => student.id !== studentId));
    }

    const editStudent = async (studentId, student) => {
        await studentsService.editStudent(studentId, student);
        setStudents(current => current.map(s => s.id === studentId ? merge(s, student) : s));
    }

    const newStudent = async student => {
        const createdStudent = await studentsService.newStudent(student);
        setStudents(current => [...current, createdStudent]);
        return createdStudent;
    }

    const deleteCourse = async courseId => {
        await coursesService.deleteCourse(courseId);
        setCourses(current => current.filter(course => course.id !== courseId));
    }

    const newCourse = async course => {
        const createdCourse = await coursesService.newCourse(course);
        setCourses(current => [...current, createdCourse]);
        return createdCourse;
    }

    const addStudent = async (courseId, studentsIds) => {
        const editedCourse = await coursesService.addStudent(courseId, studentsIds);
        editedCourse.label = editedCourse.name;
        editedCourse.value = editedCourse.id;
        setCourses(current => current.map(course => course.id === courseId ? editedCourse : course));
        return editedCourse;
    }

    const editTask = async task => {
        await tasksService.editTask(task);
        setTasks(current => current.map(t => t.id === task.id ? task : t));
    }

    const deleteTask = async taskId => {
        await tasksService.deleteTask(taskId);
        setTasks(current => current.filter(task => task.id !== taskId));
    }

    const createTask = async task => {
        const createdTask = await tasksService.createTask(task);
        setTasks(current => [...current, createdTask]);
        return createdTask;
    }

    const associateTask = async (courseId, task) => {
        const createdTask = await coursesService.associateTask(courseId, task);
        setCourses(current => current.map(course => {
            if (course.id === courseId) {
                createdTask.students = course.students;
                course.courseTasks.push(createdTask);
            }
            return course;
        }));
    }

    const changeTaskStatus = async (courseId, taskId, studentId, taskStatus) => {
        await coursesService.changeTaskStatus(taskId, studentId, taskStatus);
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
        createdTemplate.label = createdTemplate.title;
        createdTemplate.value = createdTemplate.id;
        setTemplates(current => [...current, createdTemplate]);
        return createdTemplate;
    }

    return (
        <Context.Provider value={{
            colleges,
            courses,
            students,
            tasks,
            payments,
            templates,
            isLoadingColleges,
            isLoadingCourses,
            isLoadingPayments,
            isLoadingStudents,
            isLoadingTasks,
            isLoadingTemplates,
            setUser,
            informPayment,
            deleteCollege,
            addCoursesToCollege,
            newCollege,
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
        }}>{children}</Context.Provider>
    );
}