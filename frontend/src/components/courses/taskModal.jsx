import React, { useEffect, useState, useContext } from "react";
import CommonInput from "../commonInput";
import Modal from "../modal";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useFormik } from 'formik';
import { Context } from "../../context/Context";
import Select from "../select/select";
import tasksService from "../../services/tasksService";

export default function TaskModal(props) {
    const { associateTask, changeAlertStatusAndMessage } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [taskTitle, setTaskTitle] = useState("");
    const [limitDate, setLimitDate] = useState(dayjs(new Date()));

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
            title: values.title,
            comment: values.comment,
            limitDate: limitDate
          };
          setIsLoading(true);
          try {
            await associateTask(props.courseId, body);
            setIsLoading(false);
            setDisplay(false);
          } catch (error) {
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
    }, [taskTitle])

    useEffect(() => {
        if (selectedTask != null){
            setLimitDate(dayjs(new Date(selectedTask.limitDate)))
        }
    }, [selectedTask])
    
    


    return(
        <>          
                <Modal icon={<AddTaskIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Agregando...</span></>) : <span>Agregar tarea</span>} onClick={formik.handleSubmit} title={`Agregar tarea a ${'"' + props.courseName + '"'}`} children={<>
                <form className="pt-6 mb-4 mx-auto w-4/6"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                           <div className="mb-4 z-100">
                            <Select
                                label="Título"
                                name="title"
                                onChange={setSelectedTask}
                                onInputChange={(newText) => setTaskTitle(newText)}
                                options={tasks}
                                value={selectedTask}
                                getOptionLabel ={(course)=> course.title}
                                getOptionValue ={(course)=> course.id}
                                type="text" 
                                placeholder="Título"
                                htmlFor="title"
                                id="title" 
                            />
                        </div>
                        <div className="mb-4">
                            <CommonInput 
                                label="Comentarios"
                                name="comment"
                                onBlur={formik.handleBlur}
                                value={selectedTask != null ? selectedTask.comment : formik.values.comment}
                                className="block font-bold text-sm text-gray-700 mb-4"
                                type="text" 
                                htmlFor="comment"
                                id="comment" 
                                onChange={formik.handleChange}
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