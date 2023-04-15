import React, { useContext, useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import Modal from "../../../components/modal";
import { useFormik } from 'formik';
import CommonInput from "../../../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import { Context } from "../../../context/Context";
import dayjs from 'dayjs';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ClassesTable from "../../classesTable";

export default function ClassesSection(props) {

    const { clazzes, deleteClazz, editClazz, newClazz } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [clazzId, setClazzId] = useState(null);
    const [edit, setEdit] = useState(false);
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [clazzToEdit, setClazzToEdit] = useState({});
    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setClazzId(id);
    }

    const openEditModal = async (clazz) => {
        setClazzToEdit(clazz);
        setEdit(true);
        setDisplayModal(true);
        setClazzId(clazz.id);
    }

    const handleDeleteClazz = async () => {
        setIsLoading(true);
        await deleteClazz(clazzId);
        setIsLoading(false);
        setDeleteModal(false);
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: edit ? clazzToEdit.title : '',
            professor: edit ? clazzToEdit.professor : '',
            startAt: edit ? clazzToEdit.startAt : startAt
        },
        onSubmit: async (values) => {
          const body = {
            title: values.title,
            professor: values.professor,
            startAt: values.startAt
          };
          setIsLoading(true);
          try {
            if(edit) {
                await editClazz(clazzId, body);
                setEdit(false);
                formik.values = {};
            }else {
                await newClazz(body);
                formik.values = {};
            }
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            setIsLoading(false);
            setDisplayModal(false);
          }
          formik.values = {};
        },
      });


    /*const white = orange[50];*/

    return(<>
        <div className="my-6 md:my-12 mx-8 md:mx-4">
            <ClassesTable 
                clazzes={clazzes}
                onDelete={openDeleteModal}
                onEdit={openEditModal}
            />
        </div>
        <div className="flex justify-end">
            <button onClick={() => setDisplayModal(true)}
                    className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
            </button>
        </div>
        <Modal icon={<HistoryEduIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar clase' : 'Agregar clase'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
            <form className="pr-8 pt-6 mb-4"    
                method="POST"
                id="form"
                onSubmit={formik.handleSubmit}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="mb-4 relative col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                            Fecha de inicio
                        </label>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                                <DateTimePicker
                                label="Seleccionar fecha"
                                value={startAt}
                                onChange={(newValue) => setStartAt(newValue)}
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </div>
                    <div className="mb-4">
                        <CommonInput 
                            label="Titulo"    
                            onBlur={formik.handleBlur}
                            value={formik.values.title}
                            name="title"
                            htmlFor="title"
                            id="title" 
                            type="text" 
                            placeholder="Titulo" 
                            onChange={formik.handleChange}
                        />
                    </div>
                    <div className="mb-4">
                        <CommonInput 
                                label="Docente"    
                                onBlur={formik.handleBlur}
                                value={formik.values.professor}
                                name="professor"
                                htmlFor="professor"
                                id="professor" 
                                type="text" 
                                placeholder="Docente"
                                onChange={formik.handleChange}
                        />
                    </div>
                </div>
            </form>
        </>
        } />
        <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar clase" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteClazz} children={<><div>Esta a punto de elimnar esta clase. ¿Desea continuar?</div></>} />
    </>);
} 