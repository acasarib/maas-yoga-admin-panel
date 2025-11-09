import React, { useContext, useEffect, useState } from 'react'
import useModal from '../../hooks/useModal';
import Table from '.';
import AssignmentIcon from '@mui/icons-material/Assignment';
import useResize from '../../hooks/useResize';
import SchoolIcon from '@mui/icons-material/School';
import Modal from '../modal';
import { formatDateDDMMYY } from "../../utils";
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';
import { Context } from '../../context/Context';
import EditTaskModal from '../courses/editTaskModal';
import DeleteButton from '../button/deleteButton';
import EditButton from '../button/editButton';
import NoDataComponent from './noDataComponent';
import { COLORS } from '../../constants';

const TasksTable = ({ course, onUpdateTask }) => {
    const { changeTaskStatus, changeAlertStatusAndMessage, deleteCourseTask } = useContext(Context)
    const [taskToDelete, setTaskToDelete] = useState({});
    const [deleteTaskModal, setDeleteTaskModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const studentsTasksModal = useModal()
    const editTaskModal = useModal()
    const [editingTask, setEditingTask] = useState(null)
    const [taskId, setTaskId] = useState(null)
    const { width } = useResize()
    let style = {};

    if (width >= 768) {
        style.minWidth = '750px';
    }

    const handleSeeStudents = (taskId) => {
        setTaskId(taskId)
        studentsTasksModal.open()
    }

    const handleCloseSeeTaskModal = () => {
        setTaskId(null)
        studentsTasksModal.close()
    }

    const handleChangeTaskStatus = async (studentId, taskStatus) => {
        try {
            await changeTaskStatus(taskId, studentId, taskStatus);
        } catch(error) {
            changeAlertStatusAndMessage(true, 'error', 'El estado de la tarea no pudo ser editado... Por favor inténtelo nuevamente.')
            console.log(error);
        }
    }

    const openDeleteTaskModal = (id, title) => {
        setDeleteTaskModal(true);
        setTaskToDelete({id, title});
    }

    const openEditTaskModal = (task) => {
        editTaskModal.open()
        setEditingTask(task)
    }

    const handleCloseDeleteTask = () => {
        setDeleteTaskModal(false);
        setTaskToDelete({});
    }

    const handleDeleteTask = async () => {
        try {
            setIsLoading(true);
            await deleteCourseTask(taskToDelete.id);
            handleCloseDeleteTask();
            onUpdateTask()
        } catch(error) {
            changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser eliminada... Por favor inténtelo nuevamente.')
            console.log(error);
            handleCloseDeleteTask();
        }
    }

    const taskColumn = [
        {
            name: 'Título',
            selector: row => row.title,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Comentarios',
            cell: row => 
            <div className="flex flex-col justify-center">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="group cursor-pointer relative inline-block">{row.comment}
                        <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                        {row.comment}
                        <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                </div>
            </div>,
            sortable: true,
        },
        {
            name: 'Alumnos',
            selector: row => 
                <div className="flex-row">
                    <button style={{ color: COLORS.primary[900] }} className="underline mx-1" onClick={() => handleSeeStudents(row.id)}>
                        Ver alumnos
                    </button>
                </div>,
            sortable: true,
        },
        {
            name: 'Fecha limite',
            selector: row => formatDateDDMMYY(row.limitDate),
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => (
            <div className="flex flex-nowrap">
                <DeleteButton onClick={() => openDeleteTaskModal(row.id, row.title)}/>
                <EditButton onClick={() => openEditTaskModal(row)}/>
            </div>),
            sortable: false,
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
            cell: row => 
            <div className="flex flex-col justify-center">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                    <div className="group cursor-pointer relative inline-block">{row.email}
                        <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                        {row.email}
                        <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
                        </div>
                    </div>
                </div>
            </div>,
            sortable: true,
        },
        {
            name: 'Estado de la tarea',
            selector: row => row.studentCourseTask.completed ? 'Completada' : 'No completada'
        },
        {
            name: 'Acciones',
            cell: row => (
            <div className="flex flex-nowrap">
                <button className="rounded-full p-1 bg-red-300 hover:bg-red-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, false)}>
                    <RemoveDoneIcon />
                </button>
                <button className="rounded-full p-1 bg-green-300 hover:bg-green-400 mx-1" onClick={() => handleChangeTaskStatus(row.id, true)}>
                    <DoneOutlineIcon />
                </button>
            </div>),
            sortable: true,
        },
    ];

    useEffect(() => {
        if (taskId != null) {
            setTaskId(course.courseTasks.find(ct => ct.id == taskId).id)
        }
    }, [course])
    

  return (<>
    <Table
        columns={taskColumn}
        data={course.courseTasks}
        noDataComponent={<NoDataComponent Icon={AssignmentIcon} title="No hay tareas" subtitle="Este curso no cuenta con tareas aún"/>}
        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
    /> 
    <Modal
        style={style}
        hiddingButton
        icon={<SchoolIcon />}
        open={studentsTasksModal.isOpen}
        setDisplay={handleCloseSeeTaskModal}
        closeText="Salir"
        title={'Alumnos de la tarea ' + '"' + course.title + '"'}
    >
        <div>
            {taskId !== null &&
                <Table
                    columns={taskStudentsColumns}
                    data={course.courseTasks.find(ct => ct.id === taskId).students}
                    noDataComponent="Esta tarea aun no posee alumnos"
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
            }
        </div>
    </Modal>
    <Modal danger icon={<DeleteIcon />} open={deleteTaskModal} setDisplay={handleCloseDeleteTask} title="Eliminar tarea" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteTask} children={<><span>Esta a punto de elimnar la tarea <strong>{taskToDelete.title}</strong>. ¿Desea continuar?</span></>} />
    <EditTaskModal
        isOpen={editTaskModal.isOpen}
        task={editingTask}
        onClose={editTaskModal.close}
        onEditTask={onUpdateTask}
    />
</>)
}

export default TasksTable