import React, { useEffect, useState, useContext } from "react";
import CommonInput from "../commonInput";
import Modal from "../modal";
import dayjs from 'dayjs';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from 'formik';
import { Context } from "../../context/Context";
import coursesService from "../../services/coursesService";
import DateTimeInput from "../calendar/dateTimeInput";

export default function EditTaskModal({ isOpen, task, onClose, onEditTask }) {
    const { changeAlertStatusAndMessage } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [limitDate, setLimitDate] = useState(dayjs(new Date()));

    const formik = useFormik({
        initialValues: task == null ? {} : task,
        onSubmit: async (values) => {
          const body = {
            ...task,
            title: values.title,
            comment: values.comment,
            limitDate: limitDate
          };
          setIsLoading(true);
            try {
                await coursesService.updateCourseTask(body)
                setIsLoading(false);
                onEditTask()
            } catch (error) {
                console.log(error);
                changeAlertStatusAndMessage(true, 'error', 'La tarea no pudo ser asociada... Por favor inténtelo nuevamente.')
            }
            onClose();
            formik.values = {};
        },
    });

    useEffect(() => {
        if (!task) return
        formik.setValues({
            title: task.title || '',
            comment: task.comment || '',
        });
        setLimitDate(dayjs(new Date(task.limitDate)))
    }, [task])

    return(
        <>          
                <Modal size="small" icon={<EditIcon />} open={isOpen} setDisplay={onClose} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Editando...</span></>) : <span>Editar tarea</span>} onClick={formik.handleSubmit} title={`Editar tarea`} children={<>
                    <form className="flex flex-col gap-6" 
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <CommonInput
                            label="Título"
                            name="title"
                            onBlur={formik.handleBlur}
                            value={formik.values.title}
                            className="block font-bold text-sm text-gray-700 mb-4"
                            type="text" 
                            placeholder="Título"
                            onChange={formik.handleChange}
                            htmlFor="title"
                            id="title" 
                        />

                        <CommonInput 
                            label="Comentarios"
                            name="comment"
                            value={formik.values.comment}
                            className="block font-bold text-sm text-gray-700 mb-4"
                            type="text" 
                            htmlFor="comment"
                            id="comment" 
                            onChange={formik.handleChange}
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