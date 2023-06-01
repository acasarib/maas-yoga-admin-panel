import React, { useContext, useState, useEffect } from "react";
import AddIcon from '@mui/icons-material/Add';
import Select from "react-select";
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
import WeekdayPicker from "../../weekdayPicker";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ViewSlider from 'react-view-slider';

export default function ClassesSection(props) {

    const { clazzes, deleteClazz, editClazz, newClazz, changeAlertStatusAndMessage, colleges } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [clazzId, setClazzId] = useState(null);
    const [edit, setEdit] = useState(false);
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [endAt, setEndAt] = useState(dayjs(new Date()));
    const [activeView, setActiveView] = useState(0);
    const [btnText, setBtnText] = useState("Siguiente");
    const [clazzToEdit, setClazzToEdit] = useState({});
    const [selectedCollege, setSelectedCollege] = useState(null);
    const daysInitialState = [{
      "key": "mon",
      "label": "Lun",
      "completeLabel": "Lunes",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "tue",
      "label": "Mar",
      "completeLabel": "Martes",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "wed",
      "label": "Mie",
      "completeLabel": "Miercoles",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "thu",
      "label": "Jue",
      "completeLabel": "Jueves",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "fri",
      "label": "Vie",
      "completeLabel": "Viernes",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "sat",
      "label": "Sab",
      "completeLabel": "Sabado",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    },
    {
      "key": "sun",
      "label": "Dom",
      "completeLabel": "Domingo",
      "startAt": null,
      "endAt": null,
      "isSelected": false,
    }];
    const [days, setDays] = useState(daysInitialState);
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
        setDays(current => current.map(d => d.key in clazz.days ? ({ ...d, isSelected: true, startAt: clazz.days[d.key].startAt, endAt: clazz.days[d.key].endAt }) : d))
        setSelectedCollege(colleges.find(c => c.id === clazz.headquarterId));
        setEdit(true);
        setDisplayModal(true);
        setClazzId(clazz.id);
    }

    const handleDeleteClazz = async () => {
        setIsLoading(true);
        try {
            await deleteClazz(clazzId);
            setIsLoading(false);
            setDeleteModal(false);
        } catch(e) {
            changeAlertStatusAndMessage(true, 'error', 'La clase no pudo ser eliminada... Por favor inténtelo nuevamente.')
            setIsLoading(false);
            setDeleteModal(false);
        }
    }

    const renderView = ({ index, active, transitionState }) => (
        <>
        {index === 0 &&
        <form className="pr-8 pt-6 mb-4"    
            method="POST"
            id="form"
            onSubmit={formik.handleSubmit}
        >
            <div className="grid grid-cols-2 gap-4">
                <div className="mb-4 relative col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
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
                <div className="mb-4 relative col-span-2">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Fecha de finalización
                    </label>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                            <DateTimePicker
                            label="Seleccionar fecha"
                            value={endAt}
                            onChange={(newValue) => setEndAt(newValue)}
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
                <div className="col-span-2 md:col-span-2 pb-3">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Sede</span>
                    <div className="mt-4">
                        <Select
                            value={selectedCollege}
                            onChange={setSelectedCollege}
                            options={colleges}
                            styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
                        />
                    </div>
                </div>
            </div>
        </form>
        }
        {index === 1 && <>
        <div className="w-full flex justify-between">
            <div><ArrowBackIcon onClick={() => setActiveView(0)} className="cursor-pointer"/></div>
            <div><h1 className="text-2xl md:text-3xl text-center mb-4">Dias de la clase</h1></div>
            <div></div>
        </div>
        <div className="col-span-2 md:col-span-2 pb-3">
            <WeekdayPicker days={days} setDays={setDays}/>
        </div>
        </>}</>
    );

    const onCloseModal = () => {
      setActiveView(0);
      setDays(daysInitialState);
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: edit ? clazzToEdit.title : '',
            professor: edit ? clazzToEdit.professor : '',
            startAt: edit ? clazzToEdit.startAt : startAt,
            endAt: edit ? clazzToEdit.endAt : endAt,
        },
        onSubmit: async (values) => {
          const daysParam = {};
          days.filter(d => d.isSelected && d.startAt && d.endAt).map(d => {
            daysParam[d.key] = { startAt: d.startAt, endAt: d.endAt };
            return d;
          });
          const body = {
            title: values.title,
            professor: values.professor,
            startAt: startAt,
            endAt: endAt,
            headquarterId: selectedCollege.id,
            days: daysParam,
          };
          console.log(body);
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
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'La clase no pudo ser informada... Por favor inténtelo nuevamente.')
          }
          setDays(daysInitialState);
          setActiveView(0);
          setSelectedCollege(null);
          setIsLoading(false);
          setDisplayModal(false);
          formik.values = {};
        },
    });

    useEffect(() => {
        if (activeView === 0)
            setBtnText("Siguiente");
        else
            setBtnText(edit ? "Editar" : "Crear");
    }, [activeView]);

    const handleOnClickNext = async (e) => {
        if (activeView === 0) {
            setActiveView(1);
        } else {
            console.log("submit");
            formik.handleSubmit(e);
        }
        
    }

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
        <Modal onClose={onCloseModal} className="modal-responsive w-full md:w-10/12 lg:w-8/12 xl:w-7-12 2xl:w-6/12" icon={<HistoryEduIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar clase' : 'Agregar clase'} buttonText={<span>{btnText}</span>} onClick={handleOnClickNext} children={<>
            <ViewSlider
                renderView={renderView}
                numViews={2}
                activeView={activeView}
                animateHeight
                style={{ overflow: 'auto', padding: '4px'}}
            />
        </>
        } />
        <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar clase" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteClazz} children={<><div>Esta a punto de elimnar esta clase. ¿Desea continuar?</div></>} />
    </>);
} 