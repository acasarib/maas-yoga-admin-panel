import React, { useContext, useEffect, useState } from "react";
import TaskCard from "../components/taskCard";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import { useFormik } from 'formik';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import tasksService from "../services/tasksService";
import CommonInput from "../components/commonInput";
import Delete from "@mui/icons-material/Delete";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Context } from "../context/Context";
import InfoIcon from '@mui/icons-material/Info';

export default function Tasks(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const { tasks, editTask, deleteTask, createTask, changeAlertStatusAndMessage } = useContext(Context);
    const [taskId, setTaskId] = useState(null);
    const [taskToEdit, setTaskToEdit] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState('1');
    const [pendingTasks, setPendingTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const theme = createTheme({
        palette: {
          primary: {
            // Purple and green play nicely together.
            main: orange[500],
          },
          secondary: {
            // This is green.A700 as hex.
            main: '#11cb5f',
          },
        },
    });

    const openEditModal = (task) => {
        setEdit(true);
        setDisplayModal(true);
        setTaskId(task.id);
        setTaskToEdit(task);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setTaskId(id);
    }
    
    const resolveTask = async (task) => {
        setIsLoading(true);
        task.completed = true;
        try{
            await editTask(task);
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
            }else{
                await createTask(body);
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

    useEffect(() => {
        const pendingList = tasks.filter(task => task.completed === false);
        setPendingTasks(pendingList);
        const completedList = tasks.filter(task => task.completed === true);
        setCompletedTasks(completedList);
    }, [tasks]);

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Tareas pendientes</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                <ThemeProvider theme={theme}>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <TabContext value={value}>
                            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChange} aria-label="lab API tabs example" textColor="primary" indicatorColor="primary">
                                <Tab label="Todas" value="1"/>
                                <Tab label="Pendientes" value="2" icon={(pendingTasks.length > 0) && <><InfoIcon className="ml-1"/></>} iconPosition="end" />
                                <Tab label="Completadas" value="3" />
                            </TabList>
                            </Box>
                            <TabPanel value="1">{(tasks.length > 0) ? 
                                tasks.map((task) =>
                                <TaskCard title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                            ) :
                                'No hay tareas'
                            }</TabPanel>
                            <TabPanel value="2">{(pendingTasks.length > 0) ? 
                                pendingTasks.map((task) =>
                                <TaskCard title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                            ) :
                                'No hay tareas pendientes'
                            }</TabPanel>
                            <TabPanel value="3">{(completedTasks.length > 0) ?
                                completedTasks.map((task) =>
                                <TaskCard title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
                            ) :
                                'No hay tareas completadas'
                            }</TabPanel>
                        </TabContext>
                    </Box>
                </ThemeProvider>
                </div>
                <div className="flex justify-end">
                        <button onClick={() => setDisplayModal(true)}
                                className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                        </button>
                </div>
                <Modal icon={<AssignmentTurnedInIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar tarea' : 'Agregar tarea'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
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
                            </div>
                        </form>
                    </>
                    } />
                    <Modal icon={<Delete />} open={deleteModal} setDisplay={setDisplay} title="Eliminar tarea" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteTask} children={<><div>Esta a punto de elimnar esta tarea. ¿Desea continuar?</div></>} />
              </div>
            </div>
        </>
    );
} 