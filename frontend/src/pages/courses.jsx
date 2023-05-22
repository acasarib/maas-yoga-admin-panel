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

export default function Courses(props) {
    const { courses, students, isLoadingStudents, deleteCourse, addStudent, newCourse, changeTaskStatus, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startAt, setStartAt] = useState(dayjs(new Date()));
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

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
        setDisplayStudentsModal(value);
        setAddTaskModal(value);
        setDisplayTasksModal(value);
        setIsTaskStudentModal(value);
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
        setDisplayModal(true);
        setCourseId(course.id);
        setCourseToEdit(course);
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

    const handleChangeTaskStatus = async (studentId, taskStatus) => {
        try {
            await changeTaskStatus(tasksLists[0].courseId, taskId, studentId, taskStatus);
        } catch(error) {
            changeAlertStatusAndMessage(true, 'error', 'El estado de la tarea no pudo ser editado... Por favor inténtelo nuevamente.')
            console.log(error);
        }
    }

    const columns = [
        {
            name: 'Título',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.title}
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
            name: 'Descripción',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.description}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.description}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
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
            startAt: edit ? courseToEdit.startAt : startAt,
            duration: edit ? courseToEdit.duration : ''
        },
            onSubmit: async (values) => {
                const body = {
                  title: values.title,
                  description: values.description,
                  startAt: startAt,
                  duration: values.duration
                };
                setIsLoading(true);
                try {
                  if(edit) {
                        await coursesService.editCourse(courseId, body);
                        setEdit(false);
                        if(selectedOption.length > 0) {
                            await addStudent(courseId, selectedOption);
                        }
                  }else{
                        const response = await newCourse(body);
                        setCourseId(response.id);
                        if(selectedOption.length > 0) {
                            await addStudent(response.id, selectedOption);
                        }
                  }
                  setIsLoading(false);
                  setDisplayModal(false);
                } catch (error) {
                    changeAlertStatusAndMessage(true, 'error', 'El curso no pudo ser informado... Por favor inténtelo nuevamente.')
                  setIsLoading(false);
                  setDisplayModal(false);
                }
                formik.values = {};
              },
      });

    useEffect(() => {
        console.log('Cantidad seleccionada ' + selectedOption.length + '...');
    }, [selectedOption])

    useEffect(() => {
        if(students.length === 0 && !isLoadingStudents)
            setOpResult('No fue posible obtener los cursos, por favor recargue la página...')
    }, [students, isLoadingStudents]);

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                    <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Cursos</h1>
                    <div className="my-6 md:my-12 mx-8 md:mx-4">
                        <Table
                            columns={columns}
                            data={courses}
                            noDataComponent={opResult}
                            pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        />
                    </div>
                    <div className="flex justify-end">
                        <button onClick={() => setDisplayModal(true)}
                                className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                        </button>
                    </div>
                    <Modal icon={<LocalLibraryIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar curso' : 'Agregar curso'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
                        <form className="pr-8 pt-6 mb-4"    
                            method="POST"
                            id="form"
                            onSubmit={formik.handleSubmit}
                        >
                            <div className="grid grid-cols-2 gap-4">
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
                                <div className="mb-4 relative col-span-2">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                        Fecha de inicio
                                    </label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                                            <DateTimePicker
                                            label="Seleccionar fecha"
                                            value={startAt}
                                            onChange={(newValue) => setStartAt(newValue)}
                                            />
                                        </DemoContainer>
                                    </LocalizationProvider>
                                </div>
                            </div>
                            <div className="mb-4 w-3/6">
                                    <CommonInput 
                                        label="Duración"    
                                        onBlur={formik.handleBlur}
                                        value={formik.values.duration}
                                        name="duration"
                                        htmlFor="duration"
                                        id="duration" 
                                        type="text" 
                                        placeholder="Duración" 
                                        onChange={formik.handleChange}
                                    />
                            </div>
                            <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                        Asignar alumnos
                                    </label>
                                    <Select isMulti onChange={handleChange} options={students} />
                            </div>
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
                </div>    
            </div>
        </>
    );
} 