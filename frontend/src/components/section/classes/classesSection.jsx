import React, { useContext, useState, useEffect } from "react";
import Modal from "../../../components/modal";
import { useFormik } from 'formik';
import CommonInput from "../../../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import { Context } from "../../../context/Context";
import dayjs from 'dayjs';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import DateTimeInput from '../../calendar/dateTimeInput';
import ClassesTable from "../../classesTable";
import WeekdayPicker from "../../weekdayPicker";
import ViewSlider from 'react-view-slider';
import ClassStepper from '../../stepper/classStepper';
import PlusButton from "../../button/plus";
import SelectColleges from "../../select/selectColleges";
import Label from "../../label/label";

export default function ClassesSection(props) {

    const { getClazzes, deleteClazz, editClazz, newClazz, changeAlertStatusAndMessage, getColleges } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [clazzId, setClazzId] = useState(null);
    const [clazzToDelete, setClazzToDelete] = useState(null);
    const [edit, setEdit] = useState(false);
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [endAt, setEndAt] = useState(dayjs(new Date()));
    const [activeView, setActiveView] = useState(0);
    const [btnText, setBtnText] = useState("Siguiente");
    const [clazzToEdit, setClazzToEdit] = useState({});
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [title, setTitle] = useState('');
    const [professor, setProfessor] = useState('');
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
    const [clazzes, setClazzes] = useState([]);
    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const fetchClazzes = async (force = false) => {
        setIsLoading(true)
        const clazzes = await getClazzes(force);
        setClazzes(clazzes);
        setIsLoading(false)
    }

    useEffect(() => {
        fetchClazzes(true);
    }, [])
    

    const openDeleteModal = (clazz) => {
        setDeleteModal(true);
        setClazzId(clazz.id);
        setClazzToDelete(clazz);
    }

    const openEditModal = async (clazz) => {
        const colleges = await getColleges()
        setClazzToEdit(clazz);
        setTitle(clazz.title || '');
        setProfessor(clazz.professor || '');
        setStartAt(clazz.startAt ? dayjs(clazz.startAt) : dayjs(new Date()));
        setEndAt(clazz.endAt ? dayjs(clazz.endAt) : dayjs(new Date()));
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
            setTimeout(() => {
                fetchClazzes(true);
            }, 150);
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
        <form className="flex flex-col sm:grid sm:grid-cols-2 gap-6"
            method="POST"
            id="form"
            onSubmit={formik.handleSubmit}
        >
            <CommonInput 
                label="Título"    
                value={title}
                name="title"
                htmlFor="title"
                id="title" 
                type="text" 
                placeholder="Título" 
                onChange={(event) => setTitle(event.target.value)}
            />


            <CommonInput 
                label="Docente"    
                value={professor}
                name="professor"
                htmlFor="professor"
                id="professor" 
                type="text" 
                placeholder="Docente"
                onChange={(event) => setProfessor(event.target.value)}
            />

            <div className="col-span-2">
                <Label htmlFor="headquarter">Sede</Label>
                <SelectColleges
                    name="headquarter"
                    classNames={{
                        menu: () => "relative-important",
                    }}
                    itemClassName="absolute"
                    value={selectedCollege}
                    onChange={setSelectedCollege}
                    styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
                />
            </div>
        </form>
        }
        {index === 1 && <div className="flex flex-col gap-4">
            <div className='relative'>
                <DateTimeInput
                    className="w-full sm:w-auto"
                    name="startAt"
                    label="Fecha de inicio"
                    value={startAt}
                    onChange={(newValue) => setStartAt(newValue)}
                />
            </div>
            <div className="relative">
                <DateTimeInput
                    className="w-full sm:w-auto"
                    name="endAt"
                    label="Fecha de finalización"
                    value={endAt}
                    onChange={(newValue) => setEndAt(newValue)}
                />
            </div>
        </div>}
        {index === 2 && <>
            <div className="w-full flex justify-center items-center mb-4">
                <div><h1 className="text-2xl md:text-3xl text-center">Dias de la clase</h1></div>
                <div></div>
            </div>
            <div className="col-span-2 md:col-span-2 pb-3">
                <WeekdayPicker days={days} setDays={setDays}/>
            </div>
        </>}
        </>
    );

    const onCloseModal = () => {
      setActiveView(0);
      setDays(daysInitialState);
      setTitle('');
      setProfessor('');
      setSelectedCollege(null);
      setStartAt(dayjs(new Date()));
      setEndAt(dayjs(new Date()));
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
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
            title,
            professor,
            startAt: startAt,
            endAt: endAt,
            headquarterId: selectedCollege.id,
            days: daysParam,
          };
          setIsLoading(true);
          try {
            if(edit) {
                await editClazz(clazzId, body);
                setEdit(false);
                setTimeout(() => {
                    fetchClazzes(true);
                }, 150);
                formik.resetForm();
            }else {
                await newClazz(body);
                setTimeout(() => {
                    fetchClazzes(true);
                }, 150);
                formik.resetForm();
            }
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'La clase no pudo ser informada... Por favor inténtelo nuevamente.')
          }
          setDays(daysInitialState);
          setActiveView(0);
          setSelectedCollege(null);
          setIsLoading(false);
          setDisplayModal(false);
          setTitle('');
          setProfessor('');
          setStartAt(dayjs(new Date()));
          setEndAt(dayjs(new Date()));
          formik.values = {};
        },
    });

    useEffect(() => {
        if (activeView === 0 || activeView === 1)
            setBtnText("Siguiente");
        else
            setBtnText(edit ? "Editar" : "Crear");
    }, [activeView, edit]);

    const handleOnClickNext = async (e) => {
        if (activeView < 2) {
            setActiveView(prev => prev + 1);
        } else {
            formik.handleSubmit(e);
        }
    }

    return(<>
        <ClassesTable 
            clazzes={clazzes}
            onDelete={openDeleteModal}
            onEdit={openEditModal}
            isLoading={isLoading}
        />
        <div className="flex justify-end mt-6">
            <PlusButton onClick={() => setDisplayModal(true)}/>
        </div>
        <Modal onClose={onCloseModal} className="modal-responsive w-full md:w-10/12 lg:w-8/12 xl:w-7-12 2xl:w-6/12" icon={<HistoryEduIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar clase' : 'Agregar clase'} buttonText={<span>{btnText}</span>} onClick={handleOnClickNext} children={<>
            <form onSubmit={formik.handleSubmit}>
                <div className="flex flex-col gap-6" style={{ minHeight: '375px' }}>
                    <div className="flex-shrink-0">
                        <ClassStepper activeStep={activeView} onStepChange={setActiveView} />
                    </div>
                    <div className="flex-1">
                        <ViewSlider
                            renderView={renderView}
                            numViews={3}
                            activeView={activeView}
                            animateHeight
                            style={{ overflow: 'auto' }}
                        />
                    </div>
                </div>
            </form>
        </>
        } />
        <Modal danger icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar clase" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteClazz} children={<><div>Esta a punto de eliminar la clase <strong>{clazzToDelete?.title || 'esta clase'}</strong>. ¿Desea continuar?</div></>} />
    </>);
} 