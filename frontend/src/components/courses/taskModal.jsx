import React, { useEffect, useState, useContext } from "react";
import CommonInput from "../commonInput";
import Modal from "../modal";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useFormik } from 'formik';
import { Context } from "../../context/Context";
import tasksService from "../../services/tasksService";
import CustomAutoSuggest from "../select/customAutoSuggest";

export default function TaskModal(props) {
    const { associateTask, changeAlertStatusAndMessage } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [limitDate, setLimitDate] = useState(dayjs(new Date()));
    const [comment, setComment] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const setDisplay = (value) => {
        setOpenModal(value);
        setIsLoading(false);
        props.setDisplay(false)
    }

    const formik = useFormik({
        initialValues: {
            title: '',
            comment: '',
            limitDate: limitDate
        },
        onSubmit: async (values) => {
          const body = {
            title: taskTitle,
            comment: comment,
            limitDate: limitDate
          };
          setIsLoading(true);
          try {
            await associateTask(props.courseId, body);
            setIsLoading(false);
            setDisplay(false);
            props.onUpdateTask()
          } catch (error) {
            console.log(error);
            
            changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser asociada... Por favor inténtelo nuevamente.')
            setIsLoading(false);
            setDisplay(false);
          }
          formik.values = {};
        },
      });

    useEffect(() => {
        setOpenModal(props.isModalOpen);
    }, [props.isModalOpen])

    const fetchTasks = async () => {
        if (taskTitle === "") return
        const tasks = await tasksService.getCoursesTasksByTitle(taskTitle)
        setTasks(tasks)
    }

    useEffect(() => {
      fetchTasks()
    }, [])
    
    const onSuggestionsFetchRequested = async ({ value }) => {
        clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(async () => {      
            const tasks = await tasksService.getCoursesTasksByTitle(value)        
            setTasks(tasks)
        }, 500)); // Espera 500ms después de que el usuario deje de escribir
    }

    const onSuggestionsClearRequested = () => {        
        setTasks([])
    }
    
    const onSuggestionSelected = (taskSelected) => {
        setComment(taskSelected.comment)
        if (taskSelected.limitDate != null){
            setLimitDate(dayjs(new Date(taskSelected.limitDate)))
        }
    }

    return(
        <>          
                <Modal icon={<AddTaskIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Agregando...</span></>) : <span>Agregar tarea</span>} onClick={formik.handleSubmit} title={`Agregar tarea a ${'"' + props.courseName + '"'}`} children={<>
                <form className="pt-6 mb-4 mx-auto w-4/6"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                           <div className="mb-4 z-100">
                           <label className={"block text-gray-700 text-sm font-bold mb-2"}>
                                Titulo
                            </label>
                            <CustomAutoSuggest
                                suggestions={tasks}
                                getSuggestionValue={(task) => task.title}
                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                placeholder={"Titulo"}
                                onSuggestionSelected={onSuggestionSelected}
                                value={taskTitle}
                                onChange={setTaskTitle}
                            />
                        </div>
                        <div className="mb-4">
                            <CommonInput 
                                label="Comentarios"
                                name="comment"
                                value={comment}
                                className="block font-bold text-sm text-gray-700 mb-4"
                                type="text" 
                                htmlFor="comment"
                                id="comment" 
                                onChange={e => setComment(e.target.value)}
                                placeholder="Comentarios"
                            />
                        </div>
                        <div className="col-span-2 pb-6">
                        <span className="block text-gray-700 text-sm font-bold mb-2">Fecha limite de entrega</span>
                            <div className="mt-4">
                                <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                                    <DateTimePicker
                                    label="Seleccionar fecha"
                                    value={limitDate}
                                    onChange={(newValue) => setLimitDate(newValue)}
                                    />
                                </DemoContainer>
                            </div>
                        </div>
                    </form>
                </>} />
        </>
    );
} 