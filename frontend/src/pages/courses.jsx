import React, { useState, useEffect, useContext } from "react";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import "react-datepicker/dist/react-datepicker.css";
import coursesService from "../services/coursesService";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Select from 'react-select';
import SchoolIcon from '@mui/icons-material/School';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskModal from "../components/courses/taskModal";
import Table from "../components/table";
import { Context } from "../context/Context";
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import ProfessorInfo from "../components/courses/professorInfo";
import CourseDetailModal from "../components/modal/courseDetailModal";

export default function Courses(props) {
    const { courses, students, professors, isLoadingStudents, deleteCourse, addStudent, newCourse, editCourse, changeTaskStatus, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [endAt, setEndAt] = useState(dayjs(new Date()));
    const [deleteModal, setDeleteModal] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando cursos...');
    const [edit, setEdit] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState({});
    const [selectedOption, setSelectedOption] = useState([]);
    const [displayStudentsModal, setDisplayStudentsModal] = useState(false);
    const [isTaskStudentModal, setIsTaskStudentModal] = useState(false);
    const [displayTasksModal, setDisplayTasksModal] = useState(false);
    const [studentsLists, setStudentsLists] = useState([]);
    const [tasksLists, setTasksList] = useState([]);
    const [courseName, setCourseName] = useState("");
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [taskId, setTaskId] = useState(null);
    const [isDateSelected, setIsDateSelected] = useState(false);
    const [newProfessor, setNewProfessor] = useState(false);
    const [courseProfessors, setCourseProfessors] = useState([]);
    const [courseDetails, setCourseDetails] = useState(null);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
        setDisplayStudentsModal(value);
        setAddTaskModal(value);
        setDisplayTasksModal(value);
        setIsTaskStudentModal(value);
        setIsDateSelected(false);
        setNewProfessor(false);
        setStartAt(dayjs(new Date()));
        setEndAt(dayjs(new Date()));
        setCourseProfessors([]);
    }

    const setDisplayTask = async (value) => {
        setAddTaskModal(value);
    }
    
    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setCourseId(id);
    }
    
    const openAddTaskmodal = (id, name) => {
        setAddTaskModal(true);
        setCourseId(id);
        setCourseName(name);
    }

    const handleDeleteCourse = async () => {
        setIsLoading(true);
        try{
            await deleteCourse(courseId);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El curso no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
        setCourseId(null);
    }

    const openEditModal = (course) => {
        setEdit(true);
        setIsDateSelected(true);
        setDisplayModal(true);
        setCourseId(course.id);
        setCourseToEdit(course);
        setStartAt(dayjs(new Date(course.startAt)));
        setEndAt(dayjs(new Date(course.endAt)));
        if(course.periods?.length > 0) {
            let periods = [];
            course.periods.forEach(period => {
              periods.push(period);
            })
            setCourseProfessors(periods);
        }
    }

    const openStudentsModal = (students, courseName) => {
        setDisplayStudentsModal(true);
        setDisplayTasksModal(false);
        setStudentsLists(students);
        setCourseName(courseName);
    }
    
    const openStudentsTaskModal = (students, courseName, id) => {
        setStudentsLists(students);
        setCourseName(courseName);
        setDisplayTasksModal(false);
        setIsTaskStudentModal(true);
        setTaskId(id);
    }

    const openTasksModal = (tasks, courseName) => {
        setDisplayTasksModal(true);
        setTasksList(tasks);
        setCourseName(courseName);
    }

    var handleChange = (selectedOpt) => {
        let arr = [];
        selectedOpt.forEach(opt => {
            arr.push(opt.id);
        })
        setSelectedOption(arr)
    };

    const getStudents = (course) => {
        let students = [];
        if(course.students) {
            course.students.forEach(student => {
                student.label = student.name + ' ' + student.lastName;
                student.value = student.id;
            })
            students = course.students;
        }
        return students;
    }

    const handleChangeTaskStatus = async (studentId, taskStatus) => {
        try {
            await changeTaskStatus(tasksLists[0].courseId, taskId, studentId, taskStatus);
        } catch(error) {
            changeAlertStatusAndMessage(true, 'error', 'El estado de la tarea no pudo ser editado... Por favor inténtelo nuevamente.')
            console.log(error);
        }
    }

    const getProfessorName = (id) => {
        const [prf] = professors.filter(prf => prf.id === id);
        const prfName = prf.name + ' ' + prf.lastName;
       return prfName;
    }

    const handleOnClickCourse = async (course) => {
        setCourseDetails(course);
    }

    const columns = [
        {
            name: 'Título',
            cell: row => {return (<><div className="flex flex-col justify-center" onClick={() => handleOnClickCourse(row)}>
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block underline text-yellow-900 mx-1 cursor-pointer">{row.title}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.title}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
            </div></>)},
            sortable: true,
            searchable: true,
            selector: row => row.title,
        },
        {
            name: 'Fecha de inicio',
            selector: row => {var dt = new Date(row.startAt);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date},
            sortable: true,
        },
        {
            name: 'Duración',
            selector: row => row.duration,
            sortable: true,
        },
        {
            name: 'Alumnos',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openStudentsModal(row.students, row.title)}>Ver alumnos</button></div>)},
            sortable: true,
        },
        {
            name: 'Tareas',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openTasksModal(row.courseTasks, row.title)}>Ver tareas</button></div>)},
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex flex-nowrap"><button className="rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1" onClick={() => openAddTaskmodal(row.id, row.title)}><AddTaskIcon /></button><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const studentsColumns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Documento',
            selector: row => row.document,
            sortable: true,
        },
        {
            name: 'Email',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.email}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.email}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
        },
        {
            name: 'Numero de telefono',
            selector: row => row.phoneNumber,
            sortable: true,
        },
    ];

    const taskColumn = [
        {
            name: 'Título',
            selector: row => row.title,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Descripción',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Comentarios',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.comment}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.comment}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
        },
        {
            name: 'Alumnos',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openStudentsTaskModal(row.students, row.title, row.id)}>Ver alumnos</button></div>)},
            sortable: true,
        },
        {
            name: 'Fecha limite',
            selector: row => {var dt = new Date(row.limitDate);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date},
            sortable: true,
        },
    ];

    const taskStudentsColumns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Email',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.email}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.email}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
        },
        {
            name: 'Estado de la tarea',
            selector: row => {if(row.studentCourseTask.completed) {
                return 'Completada'
            }else {
                return 'No completada'
            }
            },
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex flex-nowrap"><button className="rounded-full p-1 bg-red-300 hover:bg-red-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, false)}><RemoveDoneIcon /></button><button className="rounded-full p-1 bg-green-300 hover:bg-green-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, true)}><DoneOutlineIcon /></button></div>)
        },
            sortable: true,
        },
    ];



    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: edit ? courseToEdit.title : '',
            description: edit ? courseToEdit.description : '',
            startAt: edit ? dayjs(new Date(courseToEdit.startAt)) : startAt,
            endAt: edit ? dayjs(new Date(courseToEdit.endAt)) : endAt,
            professors: edit ? courseToEdit.periods : [],
        },
            onSubmit: async (values, { resetForm }) => {
                const body = {
                  title: values.title,
                  description: values.description,
                  startAt: startAt,
                  endAt: endAt,
                  professors: courseProfessors,
                };
                console.log("onSubmit body=", body);
                setIsLoading(true);
                try {
                  if(edit) {
                        await editCourse(courseId, body);
                        setEdit(false);
                        setNewProfessor(false);
                        setCourseProfessors([]);
                        if(selectedOption.length > 0) {
                            await addStudent(courseId, selectedOption);
                        }
                  }else{
                        const response = await newCourse(body);
                        setNewProfessor(false);
                        setCourseId(response.id);
                        setCourseProfessors([]);
                        if(selectedOption.length > 0) {
                            await addStudent(response.id, selectedOption);
                        }
                  }
                  setIsDateSelected(false);
                  setIsLoading(false);
                  resetForm();
                  setDisplayModal(false);
                } catch (error) {
                changeAlertStatusAndMessage(true, 'error', 'El curso no pudo ser informado... Por favor inténtelo nuevamente.')
                  setIsLoading(false);
                  setCourseProfessors([]);
                  setNewProfessor(false);
                  resetForm();
                  setDisplayModal(false);
                }
              },
    });

    const handleRadioButtons = e => formik.values.criteria = e.target.value;

    useEffect(() => {
        console.log('Cantidad seleccionada ' + selectedOption.length + '...');
    }, [selectedOption])

    useEffect(() => {
        if(students.length === 0 && !isLoadingStudents)
            setOpResult('No fue posible obtener los cursos, por favor recargue la página...')
    }, [students, isLoadingStudents]);

    return(
        <>
            <Container title="Cursos">
                <Table
                    columns={columns}
                    data={courses}
                    noDataComponent={opResult}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
                <div className="flex justify-end">
                    <PlusButton onClick={() => {
                            setDisplayModal(true);
                            setStartAt(dayjs(new Date()));
                        }
                    }/>
                </div>
                <Modal icon={<LocalLibraryIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar curso' : 'Agregar curso'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
                    <form className="pt-6 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="mb-4 relative col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Fecha de inicio
                            </label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                                    <DateTimePicker
                                    label="Seleccionar fecha"
                                    value={formik.values.startAt}
                                    onChange={(newValue) => {
                                        setStartAt(newValue);
                                        setIsDateSelected(true);
                                    }}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div className="mb-4 relative col-span-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Fecha de finalizacion
                            </label>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                                    <DateTimePicker
                                    label="Seleccionar fecha"
                                    value={formik.values.endAt}
                                    onChange={(newValue) => {
                                        setEndAt(newValue);
                                        setIsDateSelected(true);
                                    }}
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        {isDateSelected && (<><div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <CommonInput 
                                    label="Título"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.title}
                                    name="title"
                                    htmlFor="title"
                                    id="title" 
                                    type="text" 
                                    placeholder="Título" 
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="mb-4">
                                <CommonInput 
                                    label="Descripción"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    name="description"
                                    htmlFor="description"
                                    id="description" 
                                    type="text" 
                                    placeholder="Descripción"
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Asignar alumnos
                                </label>
                                <Select isMulti onChange={handleChange} options={students} defaultValue={(edit && (courseToEdit.students)) ? getStudents(courseToEdit) : []} />
                        </div>
                        {courseProfessors.length > 0 && (<>
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                Profesores
                        </label>
                        {courseProfessors.map((prf, index) => 
                            <div className="my-1 px-3 py-2 bg-orange-50 flex justify-between items-center rounded-sm w-auto" key={index}>{getProfessorName(prf.professorId)}<button type="button" className="p-1 rounded-full bg-gray-100 ml-2" onClick={() => setCourseProfessors(courseProfessors.filter((professor, idx) => idx !== index))}><CloseIcon /></button></div>
                        )}</>)}
                        {!newProfessor && (<div className="mb-4 mt-2 flex items-center justify-start">
                            <label className="block text-gray-700 text-sm font-bold">
                                Nuevo profesor
                            </label>
                            <PlusButton fontSize="large" className="w-8 h-8 mt-0 ml-3" onClick={() => {
                                    setNewProfessor(true);
                                }
                            }/>
                        </div>)}
                        {newProfessor && (<ProfessorInfo professors={professors} closeNewProfessor={(value) => setNewProfessor(value)} pushProfessor={(v) => {
                                setCourseProfessors([...courseProfessors, v]);
                                setNewProfessor(false);
                            }
                        } />)}
                        </>)}
                    </form>
                </>
                } />
                <TaskModal isModalOpen={addTaskModal} setDisplay={setDisplayTask} courseName={courseName} courseId={courseId} />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar curso" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteCourse} children={<><div>Esta a punto de elimnar este curso. ¿Desea continuar?</div></>} />
                <Modal style={{ minWidth: '750px' }} hiddingButton icon={<SchoolIcon />} open={displayStudentsModal} setDisplay={setDisplay} closeText="Salir" title={'Alumnos del curso ' + '"' + courseName + '"'} children={<><div>   <Table
                        columns={studentsColumns}
                        data={studentsLists}
                        noDataComponent="Este curso aun no posee alumnos"
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    /></div></>} />
                <Modal style={{ minWidth: '750px' }} hiddingButton icon={<SchoolIcon />} open={isTaskStudentModal} setDisplay={setDisplay} closeText="Salir" title={'Alumnos de la tarea ' + '"' + courseName + '"'} children={<><div>   <Table
                    columns={taskStudentsColumns}
                    data={studentsLists}
                    noDataComponent="Esta tarea aun no posee alumnos"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
                <Modal style={{ minWidth: '750px' }} hiddingButton icon={<SchoolIcon />} open={displayTasksModal} setDisplay={setDisplay} closeText="Salir" title={'Tareas del curso ' + '"' + courseName + '"'} children={<><div>   <Table
                    columns={taskColumn}
                    data={tasksLists}
                    noDataComponent="Este curso aun no posee tareas"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
                <CourseDetailModal isOpen={courseDetails !== null} onClose={() => setCourseDetails(null)} course={courseDetails} />
            </Container>
        </>
    );
} 