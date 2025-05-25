import React, { useState, useEffect, useContext, useMemo } from "react";
import Modal from "../components/modal";
import PaidIcon from '@mui/icons-material/Paid';
import "react-datepicker/dist/react-datepicker.css";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import dayjs from 'dayjs';
import useToggle from "../hooks/useToggle"
import AddTaskIcon from '@mui/icons-material/AddTask';
import TaskModal from "../components/courses/taskModal";
import Table from "../components/table";
import { Context } from "../context/Context";
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import Tooltip from '@mui/material/Tooltip';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import StudentCoursesInfo from "../components/section/courses/studentCoursesInfo";
import useQueryParam from "../hooks/useQueryParam";
import { STUDENT_STATUS, TABLE_SEARCH_CRITERIA } from "../constants";
import { Link } from "react-router-dom";
import StudentCalendar from "../components/calendar/studentCalendar";
import coursesService from "../services/coursesService";
import Spinner from "../components/spinner/spinner";
import CreateUpdateCourseModal from "../components/modal/createUpdateCourse";
import useModal from '../hooks/useModal'

export default function Courses(props) {
    const { isLoadingStudents, deleteCourse, changeTaskStatus, changeAlertStatusAndMessage, getStudentsByCourse } = useContext(Context);
    const [deleteModal, setDeleteModal] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [opResult, setOpResult] = useState('No hay cursos.');
    const [courseToEdit, setCourseToEdit] = useState(null);
    const [displayStudentsModal, setDisplayStudentsModal] = useState(false);
    const [isTaskStudentModal, setIsTaskStudentModal] = useState(false);
    const [displayTasksModal, setDisplayTasksModal] = useState(false);
    const [studentsLists, setStudentsLists] = useState([]);
    const [tasksLists, setTasksList] = useState([]);
    const [activeStudent, setActiveStudent] = useState(null)
    const onSeeStudentPayments = student => setActiveStudent(student)
    const [courseName, setCourseName] = useState("");
    const [addTaskModal, setAddTaskModal] = useState(false);
    const isLoading = useToggle(false);
    const [taskId, setTaskId] = useState(null);
    const [pageableCourses, setPageableCourses] = useState([]);
    const [resetTable, setResetTable] = useState(false);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [defaultIdPayment] = useQueryParam("id", undefined);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchByTitle, setSearchByTitle] = useState();
    const createUpdateCourseModal = useModal()
    const [searchTimeout, setSearchTimeout] = useState(null);
    

    const setDisplay = (value) => {
        setDeleteModal(value);
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
        isLoading.enable();
        try {
            await deleteCourse(courseId);
            fetchCourses()
        } catch {
            changeAlertStatusAndMessage(true, 'error', 'El curso no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        isLoading.disable()
        setDeleteModal(false);
        setCourseId(null);
    }

    const openEditModal = (course) => {
        createUpdateCourseModal.open()
        setCourseToEdit(course); 
    }

    const openStudentsModal = async (students, courseName, courseId) => {
        setDisplayStudentsModal(true);
        setDisplayTasksModal(false);
        setStudentsLists(await getStudentsByCourse(courseId));
        setCourseName(courseName);
    }

    const openStudentsTaskModal = async (_, courseName, id) => {
        let students = await getStudentsByCourse(courseId)
        students = students.map(st => {
            st.studentCourseTask = st.courseTasks.filter(c => c.courseId === courseId)[0].studentCourseTask
            return st;
        })
        setStudentsLists(students);
        setCourseName(courseName);
        setDisplayTasksModal(false);
        setIsTaskStudentModal(true);
        setTaskId(id);
    }

    const openTasksModal = (tasks, courseName, courseId) => {
        setDisplayTasksModal(true);
        setTasksList(tasks);
        setCourseId(courseId)
        setCourseName(courseName);
    }

    const handleChangeTaskStatus = async (studentId, taskStatus) => {
        try {
            await changeTaskStatus(taskId, studentId, taskStatus);
            fetchCourses();
        } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'El estado de la tarea no pudo ser editado... Por favor inténtelo nuevamente.')
            console.log(error);
        }
    }

    const onCloseCreateUpdateCourseModal = async () => {
        fetchCourses();
        setCourseToEdit(null)
        createUpdateCourseModal.close()
    }

    const columns = useMemo(() => [
        {
            name: 'Identificador',
            searchCriteria: TABLE_SEARCH_CRITERIA.EQUAL,
            hidden: true,
            selector: row => row.id,
            sortable: true,
            searchable: true,
            cell: () => <></>,
        },
        {
            name: 'Título',
            cell: row =>
                <Link to={`/home/courses/${row.id}`} className="flex flex-col justify-center">
                    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                        <div className="group cursor-pointer relative inline-block underline text-yellow-900 mx-1 cursor-pointer">{row.title}
                            <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                                {row.title}
                                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                            </div>
                        </div>
                    </div>
                </Link>,
            sortable: true,
            searchable: true,
            selector: row => row.title,
        },
        {
            name: 'Fecha de inicio',
            selector: row => {
                var dt = new Date(row.startAt);
                let year = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date
            },
            sortable: true,
        },
        {
            name: 'Alumnos',
            selector: row => { return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openStudentsModal(row.students, row.title, row.id)}>Ver alumnos</button></div>) },
            sortable: true,
        },
        {
            name: 'Tareas',
            selector: row => { return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openTasksModal(row.courseTasks, row.title, row.id)}>Ver tareas</button></div>) },
            sortable: true,
        },
        {
            name: 'Posee matrícula',
            selector: row => row.needsRegistration ? "Sí" : "No" ?? "No",
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => {
                return (<div className="flex flex-nowrap"><button className="rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1" onClick={() => openAddTaskmodal(row.id, row.title)}><Tooltip title="Agregar tarea"><AddTaskIcon /></Tooltip></button><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><Tooltip title="Borrar"><DeleteIcon /></Tooltip></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><Tooltip title="Editar"><EditIcon /></Tooltip></button></div>)
            },
            sortable: true,
        },
    ], []);

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
            cell: row => {
                return (<><div className="flex flex-col justify-center">
                    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                        <div className="group cursor-pointer relative inline-block">{row.email}
                            <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                                {row.email}
                                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                            </div>
                        </div>
                    </div>
                </div></>)
            },
            sortable: true,
        },
        {
            name: 'Pagos',
            cell: row => (<StudentCoursesInfo onSeePayments={onSeeStudentPayments} student={row} />),
            sortable: false,
        },
        {
            name: 'Numero de telefono',
            selector: row => row.phoneNumber,
            sortable: true,
        },
        {
            name: 'Pagó matrícula',
            selector: row => row.registrationPaid ? 'Si' : 'No',
            sortable: true,
            minWidth: '150px'
        },
        {
            name: 'Estado',
            selector: row => row.status === STUDENT_STATUS.ACTIVE ? "Activo" : "Suspendido",
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
            name: 'Comentarios',
            cell: row => {
                return (<><div className="flex flex-col justify-center">
                    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                        <div className="group cursor-pointer relative inline-block">{row.comment}
                            <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                                {row.comment}
                                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                            </div>
                        </div>
                    </div>
                </div></>)
            },
            sortable: true,
        },
        {
            name: 'Alumnos',
            selector: row => { return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openStudentsTaskModal(row.students, row.title, row.id)}>Ver alumnos</button></div>) },
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
            cell: row => {
                return (<><div className="flex flex-col justify-center">
                    <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                        <div className="group cursor-pointer relative inline-block">{row.email}
                            <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                                {row.email}
                                <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                            </div>
                        </div>
                    </div>
                </div></>)
            },
            sortable: true,
        },
        {
            name: 'Estado de la tarea',
            selector: row => row.studentCourseTask.completed ? 'Completada' : 'No completada'
        },
        {
            name: 'Acciones',
            cell: row => {
                return (<div className="flex flex-nowrap"><button className="rounded-full p-1 bg-red-300 hover:bg-red-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, false)}><RemoveDoneIcon /></button><button className="rounded-full p-1 bg-green-300 hover:bg-green-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, true)}><DoneOutlineIcon /></button></div>)
            },
            sortable: true,
        },
    ];

    useEffect(() => {
        const handleWindowResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleWindowResize);

        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, []);


    let style = {};

    if (windowWidth >= 768) {
        style.minWidth = '750px';
    }

    const fetchCourses = async (page = currentPage, size = perPage, title = searchByTitle) => {
        isLoading.enable()
        const data = await coursesService.getCourses(page, size, title);        
        isLoading.disable()
        setPageableCourses(data.data);
        setTotalRows(data.totalItems);        
    }
    

    const handlePerRowsChange = async (newPerPage, page) => {
        fetchCourses(page, newPerPage);
        setPerPage(newPerPage);
    };

    const handlePageChange = page => {        
        fetchCourses(page);
        setCurrentPage(page);
    };

    useEffect(() => {
        fetchCourses();
        setResetTable(true)
    }, [searchByTitle]);

    useEffect(() => {
        if (resetTable)
            setResetTable(false)
    }, [resetTable])
    

    const handleOnSearch = async (searchParams) => {
        clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(async () => {      
            if (searchParams.field == 'Identificador') {
                const course = await coursesService.getCourse(searchParams.searchValue)
                setPageableCourses([course])
            } else {
                setSearchByTitle(searchParams.searchValue)
            }
        }, 50)); // Espera 500ms después de que el usuario deje de escribir
    }

    return (
        <>
            <Container title="Cursos">
                <Table
                    resetTable={resetTable}
                    handleCustomSearchValue={handleOnSearch}
                    columns={columns}
                    serverPaginationData={pageableCourses}
                    paginationServer={searchByTitle == undefined || searchByTitle == ""}
                    defaultTypeValue={defaultIdPayment !== undefined ? "Identificador" : undefined}
                    defaultSearchValue={defaultIdPayment}
                    noDataComponent={opResult}
                    progressPending={isLoading.value}
                    progressComponent={<Spinner/>}
                    paginationTotalRows={totalRows}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    paginationDefaultPage={currentPage}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
                <div className="flex justify-end mt-6">
                    <PlusButton onClick={() => {setCourseToEdit(null); createUpdateCourseModal.open()}} />
                </div>

                <CreateUpdateCourseModal
                    onClose={createUpdateCourseModal.close}
                    isOpen={createUpdateCourseModal.isOpen}
                    courseToEdit={courseToEdit}
                    onFinish={onCloseCreateUpdateCourseModal}
                />

                {addTaskModal && <TaskModal onUpdateTask={fetchCourses} isModalOpen={addTaskModal} setDisplay={setDisplayTask} courseName={courseName} courseId={courseId} />}
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar curso" buttonText={isLoading.value ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteCourse} children={<><div>Esta a punto de elimnar este curso. ¿Desea continuar?</div></>} />
                <Modal size="large" style={style} hiddingButton icon={<SchoolIcon />} open={displayStudentsModal} setDisplay={setDisplay} closeText="Salir" title={'Alumnos del curso ' + '"' + courseName + '"'} children={<><div>   <Table
                    columns={studentsColumns}
                    data={studentsLists}
                    noDataComponent="Este curso aun no posee alumnos"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
                <Modal style={style} hiddingButton icon={<SchoolIcon />} open={isTaskStudentModal} setDisplay={setDisplay} closeText="Salir" title={'Alumnos de la tarea ' + '"' + courseName + '"'} children={<><div>   <Table
                    columns={taskStudentsColumns}
                    data={studentsLists}
                    noDataComponent="Esta tarea aun no posee alumnos"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
                <Modal style={style} hiddingButton icon={<SchoolIcon />} open={displayTasksModal} setDisplay={setDisplay} closeText="Salir" title={'Tareas del curso ' + '"' + courseName + '"'} children={<><div>   <Table
                    columns={taskColumn}
                    data={tasksLists}
                    noDataComponent="Este curso aun no posee tareas"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
                
                {activeStudent != null &&
                    <Modal
                        hiddingButton
                        open={activeStudent != null}
                        icon={<PaidIcon />}
                        size="large"
                        setDisplay={() => setActiveStudent(null)}
                        buttonText={"Aplicar"}
                        title={`Pagos de ${activeStudent.name} ${activeStudent.lastName} sobre el curso`}
                    >
                        <StudentCalendar periods={activeStudent.pendingPayments} registration={activeStudent.registrationPayment} />
                    </Modal>
                }
            </Container>
        </>
    );
} 