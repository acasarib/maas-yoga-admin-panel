import React, { useContext, useEffect, useState } from "react";
import TaskCard from "../components/taskCard";
import Modal from "../components/modal";
import { useFormik } from 'formik';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CommonInput from "../components/commonInput";
import Delete from "@mui/icons-material/Delete";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Context } from "../context/Context";
import InfoIcon from '@mui/icons-material/Info';
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import NoDataComponent from "../components/table/noDataComponent";
import useToggle from "../hooks/useToggle";
import Loader from "../components/spinner/loader";

export default function Tasks(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const { getTasks, editTask, deleteTask, createTask, changeAlertStatusAndMessage } = useContext(Context);
    const [taskId, setTaskId] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState({});
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState('1');
    const [pendingTasks, setPendingTasks] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const openEditModal = (task) => {
        setEdit(true);
        setDisplayModal(true);
        setTaskId(task.id);
        setTaskToEdit(task);
    }

    const openDeleteModal = (task) => {
        setDeleteModal(true);
        setTaskId(task.id);
        setTaskToDelete(task);
    }
    
    const resolveTask = async (task) => {
        setIsLoading(true);
        task.completed = true;
        try{
            await editTask(task);
            setTimeout(() => {
                fetchTasks(true);
            }, 150);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser editada... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
    }

    const handleDeleteTask = async () => {
        setIsLoading(true);
        try{
            await deleteTask(taskId);
            setTimeout(() => {
                fetchTasks(true);
            }, 150);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser eliminada... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
    }
    
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: edit ? taskToEdit.title : '',
            description: edit ? taskToEdit.description : '',
        },
        onSubmit: async (values) => {
          const body = {
            title: values.title,
            description: values.description,
          };
          setIsLoading(true);
          try {
            if(edit) {
                body.completed = false;
                body.id = taskId;
                await editTask(body);
                setEdit(false);
                await fetchTasks(true);
            }else{
                await createTask(body);
                await fetchTasks(true);
                formik.resetForm();
            }
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser informada... Por favor inténtelo nuevamente.')
            setIsLoading(false);
            setDisplayModal(false);
          }
          formik.values = {};
        },
    });

    const fetchTasks = async (force = false) => {
        setIsLoading(true);
        const tasks = await getTasks(force);
        setIsLoading(false);
        setTasks(tasks);
    }

    useEffect(() => {
        const pendingList = tasks.filter(task => task.completed === false);
        setPendingTasks(pendingList);
        const completedList = tasks.filter(task => task.completed === true);
        setCompletedTasks(completedList);
    }, [tasks]);

    useEffect(() => {
        fetchTasks()
    }, []);

    return(
        <>
            <Container title="Tareas pendientes">
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={value}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange} aria-label="lab API tabs example" textColor="primary" indicatorColor="primary">
                            <Tab label="Todas" value="1"/>
                            <Tab label="Pendientes" value="2" icon={(pendingTasks.length > 0) ? <><InfoIcon className="ml-1"/></> : <></>} iconPosition="end" />
                            <Tab label="Completadas" value="3" />
                        </TabList>
                        </Box>
                        <TabPanel className="pt-4" value="1">
                            {isLoading ? <div className="flex justify-center"><Loader className="my-16" size={16}/></div> :
                            (tasks.length > 0) ? 
                            tasks.map((task) =>
                            <TaskCard greenCheckEnabled={!task.completed} title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                        ) :
                            <NoDataComponent Icon={AssignmentTurnedInIcon} title="No hay tareas" subtitle="No hay tareas que realizar"/>
                        }</TabPanel>
                        <TabPanel className="pt-4" value="2">
                            {isLoading ? <div className="flex justify-center"><Loader className="my-16" size={16}/></div> :
                            (pendingTasks.length > 0) ? 
                            pendingTasks.map((task) =>
                            <TaskCard greenCheckEnabled title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                        ) :
                            <NoDataComponent Icon={AssignmentTurnedInIcon} title="No hay tareas pendientes" subtitle="No hay tareas que se deben realizar apareceran aqui"/>
                        }</TabPanel>
                        <TabPanel className="pt-4" value="3">
                            {isLoading ? <div className="flex justify-center"><Loader className="my-16" size={16}/></div> :
                            (completedTasks.length > 0) ?
                            completedTasks.map((task) =>
                            <TaskCard title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                        ) :
                            <NoDataComponent Icon={AssignmentTurnedInIcon} title="No hay tareas completadas" subtitle="Las tareas que se completen se veran aqui"/>
                        }</TabPanel>
                    </TabContext>
                </Box>
                <div className="flex justify-end mt-6">
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <Modal
                    icon={<AssignmentTurnedInIcon />}
                    onClick={formik.handleSubmit}
                    open={displayModal}
                    onClose={formik.resetForm}
                    setDisplay={setDisplay}
                    title={edit ? 'Editar tarea' : 'Agregar tarea'}
                    buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>}
                >
                    <form    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                        className="flex flex-col gap-6"
                    >
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
                        <CommonInput 
                            label="Descripción"    
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            name="description"
                            htmlFor="description"
                            id="description" 
                            type="textarea"
                            placeholder="Descripción"
                            onChange={formik.handleChange}
                        />
                    </form>
                </Modal>
                <Modal danger icon={<Delete />} open={deleteModal} setDisplay={setDisplay} title="Eliminar tarea" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteTask} children={<><div>Esta a punto de eliminar la tarea <strong>{taskToDelete?.title || 'esta tarea'}</strong>. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 