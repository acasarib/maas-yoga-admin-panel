import React, { useEffect, useState, useContext } from "react";
import CommonInput from "../commonInput";
import Modal from "../modal";
import dayjs from 'dayjs';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useFormik } from 'formik';
import { Context } from "../../context/Context";
import tasksService from "../../services/tasksService";
import CustomAutoSuggest from "../select/customAutoSuggest";
import DateTimeInput from "../calendar/dateTimeInput";
import Label from "../label/label";

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
                    <form className="flex flex-col gap-6"  
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div>
                           <Label htmlFor="title">Título</Label>
                            <CustomAutoSuggest
                                name="title"
                                suggestions={tasks}
                                getSuggestionValue={(task) => task.title}
                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                placeholder={"Título"}
                                onSuggestionSelected={onSuggestionSelected}
                                value={taskTitle}
                                onChange={setTaskTitle}
                            />
                        </div>
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
                        <DateTimeInput
                            className="w-full"
                            name="limitDate"
                            label="Fecha limite de entrega"
                            value={limitDate}
                            onChange={(newValue) => setLimitDate(newValue)}
                        />
                    </form>
                </>} />
        </>
    );
} 