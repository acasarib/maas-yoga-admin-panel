import React, { useEffect, useState } from "react";
import TaskCard from "../components/taskCard";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import { useFormik } from 'formik';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import tasksService from "../services/tasksService";
import CommonInput from "../components/commonInput";
import Delete from "@mui/icons-material/Delete";

export default function Tasks(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [taskId, setTaskId] = useState("");
    const [taskToEdit, setTaskToEdit] = useState({});
    const [deleteModal, setDeleteModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

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
        task.id = taskId;
        await tasksService.editTask(task);
        setIsLoading(false);
        setDeleteModal(false);
        const response = await tasksService.getTasks();
        setTasks(response);
    }

    const deleteTask = async () => {
        setIsLoading(true);
        await tasksService.deleteTask(taskId);
        setIsLoading(false);
        setDeleteModal(false);
        const response = await tasksService.getTasks();
        setTasks(response);
    }


    const tasksList = (tasks.length > 0) ? tasks.map((task) =>
        <TaskCard title={task.title} description={task.description} key={task.id} onDeleteClick={() => openDeleteModal(task.id)} onEditClick={() => openEditModal(task)} onCompleteClick={() => resolveTask(task)}/>
    ) : 'No hay tareas pendientes';

    
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
                await tasksService.editTask(body);
                setEdit(false);
            }else{
                await tasksService.createTask(body);
            }
            const response = await tasksService.getTasks();
            setTasks(response);
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            setIsLoading(false);
            setDisplayModal(false);
          }
          formik.values = {};
        },
      });

    useEffect(() => {
        setTasks(props.tasks);
    }, [props.tasks])

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Tareas pendientes</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    {tasksList}
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
                    <Modal icon={<Delete />} open={deleteModal} setDisplay={setDisplay} title="Eliminar tarea" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={() => deleteTask()} children={<><div>Esta a punto de elimnar esta tarea. ¿Desea continuar?</div></>} />
              </div>
            </div>
        </>
    );
} 