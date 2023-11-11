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

export default function TaskModal(props) {
    const { associateTask, changeAlertStatusAndMessage } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [limitDate, setLimitDate] = useState(dayjs(new Date()));

    const setDisplay = (value) => {
        setOpenModal(value);
        setIsLoading(false);
        props.setDisplay(false)
    }

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            comment: '',
            limitDate: limitDate
        },
        onSubmit: async (values) => {
          const body = {
            title: values.title,
            description: values.description,
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


    return(
        <>          
                <Modal icon={<AddTaskIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Agregando...</span></>) : <span>Agregar tarea</span>} onClick={formik.handleSubmit} title={`Agregar tarea a ${'"' + props.courseName + '"'}`} children={<>
                <form className="pt-6 mb-4 mx-auto w-4/6"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                           <div className="mb-4">
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
                        </div>
                        <div className="mb-4">
                        <CommonInput 
                            label="Descripción"
                            name="description"
                            onBlur={formik.handleBlur}
                            value={formik.values.description}
                            className="block font-bold text-sm text-gray-700 mb-4"
                            type="text" 
                            placeholder="Descripción" 
                            htmlFor="description"
                            id="description" 
                            onChange={formik.handleChange}
                        />
                        </div>
                        <div className="mb-4">
                            <CommonInput 
                                label="Comentarios"
                                name="comment"
                                onBlur={formik.handleBlur}
                                value={formik.values.comment}
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