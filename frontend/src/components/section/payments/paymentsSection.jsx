import React, { useContext, useEffect, useState } from "react";
import paymentsService from "../../../services/paymentsService";
import Select from 'react-select';
import CommonInput from "../../../components/commonInput";
import CommonTextArea from "../../../components/commonTextArea";
import Modal from "../../../components/modal";
import PaidIcon from '@mui/icons-material/Paid';
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import "react-datepicker/dist/react-datepicker.css";
import { PAYMENT_OPTIONS } from "../../../constants";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import PaymentsTable from "../../../components/paymentsTable";
import { Context } from "../../../context/Context";
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import SelectItem from "../../../components/select/selectItem";

export default function PaymentsSection(props) {

    const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = useState(false);
    const [fileName, setFilename] = useState("");
    const { clazzes, students, courses, payments, colleges, templates, isLoadingPayments, informPayment, getTemplate, newTemplate, editTemplate, changeAlertStatusAndMessage } = useContext(Context);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [ammount, setAmmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isDischarge, setIsDischarge] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [paymentAt, setPaymentAt] = useState(dayjs(new Date()));
    const [templateModal, setTemplateModal] = useState(false);
    const [templateTitle, setTemplateTitle] = useState('');
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [templateId, setTemplateId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedClazz, setSelectedClazz] = useState(null);

    const handleFileChange = (e) => {
        if (e.target.files) {
          setFile([...file, e.target.files[0]]);
          setFilename(e.target.files[0].name);
          setHaveFile(true);
        }
    };

    const uploadFile = async (file) => {
        setIsLoading(true);
        try {
            const response = await paymentsService.uploadFile(file);
            setFileId(response.id);
            setFile([]);
            setHaveFile(false);
            setFilename("");
            setIsLoading(false);
            changeAlertStatusAndMessage(true, 'success', 'El archivo fue subido exitosamente!');
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El archivo no pudo ser subido... Por favor inténtelo nuevamente.')
            setFile([]);
            setHaveFile(false);
            setFilename("");
            setIsLoading(false);
        }
    }

    const informDischarge = () => {
        setOpenModal(true);
        setIsDischarge(true);
    }

    const setDisplay = (value) => {
        setOpenModal(value);
        setIsLoadingPayment(false);
        setIsDischarge(value);
        setTemplateModal(value);
    }

    const deleteSelection = () => {
        setFile([]);
        setHaveFile(false);
        setFilename("");
    }

    const handleChangeStudent = (selectedOpt) => {
        setSelectedStudent(selectedOpt.id);
        //checkValues();
    };

    const handleChangeCourse = (selectedOpt) => {
        setSelectedCourse(selectedOpt.id);
        //checkValues();
    };

    const handleChangeAmmount = (e) => {
       setAmmount(e.target.value)
       //checkValues();
    }

    const handleChangeNote = (e) => {
        setNote(e.target.value)
        //checkValues();
     }

    const handleChangePayments = (e) => {
        setPaymentMethod(e.value);
       // checkValues();
    }

    const handleChangeTitle = (e) => {
        setTemplateTitle(e.target.value);
    }

    const handleChangeTemplates = async (e) => {
        const response = await getTemplate(e.value);
        console.log(response);
        setPaymentMethod(response.content.type);
        setAmmount(response.content.value);
        setOpenModal(true);
        setIsDischarge(true);
    }

    const handleEditTemplates = async (e) => {
        const response = await getTemplate(e.value);
        setTemplateId(response.id);
        console.log(response)
        setTemplateTitle(response.title ? response.title : '');
        setAmmount(response.content.value ? response.content.value : null);
        setIsDischarge(true);
    }

    const addTemplate = async () => {
        try{
            const body = {
                title: templateTitle,
                content: {
                    value: ammount,
                    type: paymentMethod
                }
            }
            if(isEditingTemplate) {
                await editTemplate(body, templateId);
                setDisplay(false);
            }else {
                await newTemplate(body);
                setDisplay(false);
            }
        }catch(error) {
            console.log(error)
        }
    }

    /*const checkValues = () => {
        if((ammount !== null) && (selectedCourse !== '') && (selectedStudent !== '') && (paymentMethod !== '') && (fileId !== '')){
            setDisabled(false);
            console.log(disabled)
        } else {
            setDisabled(true);
            console.log(disabled)
        }
    }*/

    const handleInformPayment = async () => {
        setIsLoadingPayment(true);
        const data = {
            itemId: selectedItem?.id,
            clazzId: selectedClazz?.id,
            headquarterId: selectedCollege?.value,
            courseId: isDischarge ? null : selectedCourse,
            paymentType: paymentMethod,
            fileId: fileId,
            paymentValue: isDischarge ? (ammount * -1) : ammount,
            studentId: isDischarge ? null : selectedStudent,
            note: note,
            at: paymentAt.$d.getTime()
        }  
        try{
            await informPayment(data);
            setIsLoadingPayment(false);
            setIsDischarge(false);
            setOpenModal(false);
        }catch(err) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser informado... Por favor inténtelo nuevamente.')
            console.log(err);
            setIsDischarge(false);
            setIsLoadingPayment(false);
        }
        setAmmount(null);
        setSelectedCollege(null);
        setPaymentMethod(null);
        setFileId(null);
        setSelectedCourse(null);
        setSelectedStudent(null);
        setSelectedClazz(null);
        setNote('');
        setSelectedItem(null);
        setPaymentAt(dayjs(new Date()));
        setOpenModal(false);
        setIsDischarge(false);
    }

    return (
        <>
        <div className="mb-6 md:my-6 mx-8 md:mx-4">
            <PaymentsTable payments={payments} isLoading={isLoadingPayments}/>
        </div>
        <Modal icon={<PaidIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Informando...</span></>) : <span>Informar</span>} onClick={handleInformPayment} title={isDischarge ? 'Informar egreso' : 'Informar ingreso'} children={<>
        <div className="grid grid-cols-2 gap-10 pr-8 pt-6 mb-4">
        {!isDischarge && (<><div className="col-span-2 md:col-span-1">
                <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione la persona que realizó el pago</span>
                <div className="mt-4"><Select onChange={handleChangeStudent} options={students} /></div>
            </div>
            <div className="col-span-2 md:col-span-1">
                <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione el curso que fue abonado</span>
                <div className="mt-4"><Select onChange={handleChangeCourse} options={courses} /></div>
            </div></>)}
            <div className="col-span-2 md:col-span-1 pb-3">
                <CommonInput 
                    label="Importe"
                    name="title"
                    className="block font-bold text-sm text-gray-700 mb-4"
                    type="number" 
                    placeholder="Importe" 
                    value={ammount}
                    onChange={handleChangeAmmount}
                />
            </div>
            <div className="col-span-2 md:col-span-1 pb-3">
                <span className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</span>
                <div className="mt-4"><Select onChange={handleChangePayments} options={PAYMENT_OPTIONS} /></div>
            </div>
                <div className="col-span-2 md:col-span-2 pb-3">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Sede</span>
                    <div className="mt-4">
                        <Select
                            value={selectedCollege}
                            onChange={setSelectedCollege}
                            options={colleges}
                            styles={{ menu: provided => ({ ...provided, zIndex: 2 }) }}
                        />
                    </div>
                </div>
            {isDischarge ?
            <div className="col-span-2 md:col-span-2 pb-3">
                <span className="block text-gray-700 text-sm font-bold mb-2">Articulo</span>
                <div className="mt-4"><SelectItem onChange={setSelectedItem} value={selectedItem} /></div>
            </div>
            :
            <div className="col-span-2 md:col-span-2 pb-3">
                <span className="block text-gray-700 text-sm font-bold mb-2">Clase</span>
                <div className="mt-4"><Select onChange={setSelectedClazz} value={selectedClazz} options={clazzes.filter(clazz => !clazz.paymentsVerified)} /></div>
            </div>
            }
            <div className="col-span-2 md:col-span-2 pb-3">
                <CommonTextArea 
                    label="Nota"
                    name="note"
                    className="block font-bold text-sm text-gray-700 mb-4"
                    type="textarea" 
                    placeholder="Nota" 
                    value={note}
                    onChange={handleChangeNote}
                />
            </div>
            <div className="col-span-2 pb-6">
                <span className="block text-gray-700 text-sm font-bold mb-2">Fecha en que se realizo el pago</span>
                <div className="mt-4"><LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                    <DateTimePicker
                    label="Seleccionar fecha"
                    value={paymentAt}
                    onChange={(newValue) => setPaymentAt(newValue)}
                    />
                </DemoContainer>
                </LocalizationProvider></div>
            </div>
        </div>
        {!haveFile ? (<><span className="block text-gray-700 text-sm font-bold mb-2">Seleccionar comprobante para respaldar la operación</span><label for="fileUpload" className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Seleccionar archivo</label>
        <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input></>) :
        (<><span className="block text-gray-700 text-sm font-bold mb-2">Nombre del archivo: {fileName}</span><div className="flex flex-rox gap-4"><button onClick={() => uploadFile(file)} className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">{isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Subiendo...</span></>) : <span>Subir archivo</span>}</button><button onClick={() => deleteSelection()} className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Eliminar selección</button></div></>)}
        </>} />
        <Modal icon={<ListAltIcon />} open={templateModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Agregando...</span></>) : <span>Agregar</span>} onClick={addTemplate} title={isEditingTemplate ? 'Editar template' : 'Crear nuevo template'} children={<>
        <div className="grid grid-cols-2 gap-10 pr-8 pt-6 mb-4">
            <div className="col-span-1 pb-3"><span className="block text-gray-700 text-sm font-bold mb-2">Seleccionar template</span><Select onChange={handleEditTemplates} options={templates} /></div>
            <div className="col-span-2 grid grid-cols-2 pb-3">
                <div className="mr-4">
                    <CommonInput 
                        label="Titulo del Template"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-4"
                        type="text" 
                        placeholder="Titulo" 
                        value={templateTitle}
                        onChange={handleChangeTitle}
                    />
                </div>
                <div>
                    <CommonInput 
                        label="Importe"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-4"
                        type="number" 
                        placeholder="Importe" 
                        value={ammount}
                        onChange={handleChangeAmmount}
                    />    
                </div>
            </div>
            <div className="col-span-2 md:col-span-2 pb-3">
                <span className="block text-gray-700 text-sm font-bold mb-2">Sede</span>
                <div className="mt-4">
                    <Select
                        value={selectedCollege}
                        onChange={setSelectedCollege}
                        options={colleges}
                        styles={{ menu: provided => ({ ...provided, zIndex: 2 }) }}
                    />
                </div>
            </div>
        </div>
        </>} />
        <div>
            <span className="block text-gray-700 text-sm font-bold mb-2">Lista de templates</span>
            <div className="flex flex-row"><span className="w-72 self-center"><Select onChange={handleChangeTemplates} options={templates} /></span><button onClick={() => setTemplateModal(true)}
                        className="ml-3 bg-yellow-900 w-12 h-12 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
            </button><button onClick={() => {
                    setTemplateModal(true);
                    setIsEditingTemplate(true);
                }
            }
                        className="ml-3 bg-orange-200 w-12 h-12 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><EditIcon fontSize="large" sx={{ color: orange[50] }} /></span>
            </button></div>
        </div>
        <div className="flex flex-row justify-end">
            <div>
                <button onClick={informDischarge}
                    className="mr-4 mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap"><span className="font-bold text-sm text-yellow-900">Informar egreso</span>
                </button>
            </div>
            <div>
                <button onClick={() => setOpenModal(true)}
                    className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap"><span className="font-bold text-sm text-yellow-900">Informar ingreso</span>
                </button>
            </div>
        </div>
        </>
    );
} 