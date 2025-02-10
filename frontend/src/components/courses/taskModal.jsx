import React, { useEffect, useState, useContext } from "react";
import CommonInput from "../commonInput";
import Modal from "../modal";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useFormik } from 'formik';
import { Context } from "../../context/Context";
import Autosuggest from 'react-autosuggest';
import tasksService from "../../services/tasksService";

export default function TaskModal(props) {
    const { associateTask, changeAlertStatusAndMessage } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [limitDate, setLimitDate] = useState(dayjs(new Date()));
    const [comment, setComment] = useState('');

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
        const tasks = await tasksService.getCoursesTasksByTitle(taskTitle)
        setTasks(tasks)
    }

    useEffect(() => {
      fetchTasks()
    }, [])
    
    const onSuggestionsFetchRequested = async ({ value }) => {
        const tasks = await tasksService.getCoursesTasksByTitle(value)        
        setTasks(tasks)
    }

    const onSuggestionsClearRequested = () => {        
        setTasks([])
    }

    const onChangeTaskTitle = (_, { newValue }) => {
        setTaskTitle(newValue)
    }
    
    const inputProps = {
        placeholder: 'Titulo',
        className: 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline',
        value: taskTitle,
        onChange: onChangeTaskTitle,
    };

    const onSuggestionSelected = (_, suggestion) => {
        const taskSelected = suggestion.suggestion
        setComment(taskSelected.comment)
        if (taskSelected.limitDate != null){
            setLimitDate(dayjs(new Date(taskSelected.limitDate)))
        }
    }

    const renderSuggestion = (task) => <span className="block p-2 cursor-pointer hover:bg-gray-200 rounded-lg text-gray-700 transition-colors">{task.title}</span>

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
                            <Autosuggest
                                suggestions={tasks}
                                renderSuggestion={renderSuggestion}
                                getSuggestionValue={(task) => task.title}
                                onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                                onSuggestionsClearRequested={onSuggestionsClearRequested}
                                inputProps={inputProps}
                                onSuggestionSelected={onSuggestionSelected}
                                theme={{
                                    container: "relative",
                                    suggestionsContainer: "absolute z-10 w-full bg-white shadow-md rounded-lg",
                                    suggestionsList: "list-none p-0 m-0",
                                    suggestion: "p-2 cursor-pointer hover:bg-gray-100 text-gray-700 rounded-md",
                                    suggestionHighlighted: "bg-blue-100",
                                }}
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