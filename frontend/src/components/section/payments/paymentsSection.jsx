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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import PaymentsTable from "../../../components/paymentsTable";
import { Context } from "../../../context/Context";
import ListAltIcon from '@mui/icons-material/ListAlt';
import EditIcon from '@mui/icons-material/Edit';
import SelectItem from "../../../components/select/selectItem";
import { Link } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import StorageIconButton from "../../button/storageIconButton";
import { useRef } from "react";
import useDrivePicker from 'react-google-drive-picker'
import useToggle from "../../../hooks/useToggle";
import { betweenZeroAnd100, formatPaymentValue } from "../../../utils";
import CustomCheckbox from "../../../components/checkbox/customCheckbox";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';

export default function PaymentsSection({ defaultSearchValue, defaultTypeValue }) {

    const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = useState(false);
    const [fileName, setFilename] = useState("");
    const { user, clazzes, students, courses, payments, colleges, services, isLoadingPayments, informPayment, getTemplate, newService, editService, changeAlertStatusAndMessage, editPayment, getHeadquarterById, getItemById, getSecretaryPaymentDetail, deleteService } = useContext(Context);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [secretaryPaymentValues, setSecretaryPaymentValues] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isSecretaryPayment, setIsSecretaryPayment] = useState(false)
    const [selectedCollege, setSelectedCollege] = useState(null);
    const inputFileRef = useRef(null);
    const [fileId, setFileId] = useState(null);
    const [ammount, setAmmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isDischarge, setIsDischarge] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [dayOfMonth, setDayOfMonth] = useState(1); 
    const [paymentAt, setPaymentAt] = useState(dayjs(new Date()));
    const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));
    const [serviceModal, setServiceModal] = useState(false);
    const [serviceNote, setServiceNote] = useState('');
    const [showSt, setShowSt] = useState(false);
    const discountCheckbox = useToggle()
    const [discount, setDiscount] = useState("")
    const [isEditingTemplate, setIsEditingTemplate] = useState(false);
    const [serviceId, setServiceId] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedClazz, setSelectedClazz] = useState(null);
    const [edit, setEdit] = useState(false);
    const [registration, setRegistration] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState('');
    const [paymentToEdit, setPaymentToEdit] = useState({});
    const [openPicker, data, authResponse] = useDrivePicker();
    const [deleteServiceModal, setDeleteServiceModal] = useState(false);
    const [driveFile, setDriveFile] = useState(null);
    const [studentCourses, setStudentCourses] = useState([]);
    const googleDriveEnabled = user !== null && "googleDriveCredentials" in user;

    const handleFileChange = (e) => {
        if (e.target.files) {
          setFile([...file, e.target.files[0]]);
          setFilename(e.target.files[0].name);
          setHaveFile(true);
        }
    };

    const handleOpenPicker = async () => {
        const { clientId, token, apiKey } = user.googleDriveCredentials;
        openPicker({
            clientId,
            developerKey: apiKey,
            token,
            viewId:'DOCS',
            showUploadView: true,
            showUploadFolders: true,
            supportDrives: true,
            multiselect: true,
            locale: "es",
            callbackFunction: (data) => {
                if (data.action === 'picked') {
                    const [file] = data.docs;
                    setDriveFile(file);
                    setFilename(file.name);
                    setHaveFile(true);
                }
            },
        })
    }


    const uploadFile = async (file) => {
        setIsLoading(true);
        try {
            const response = await paymentsService.uploadFile(file);
            setFileId(response.id);
            if(edit) {
                setPaymentToEdit({...paymentToEdit, fileId: response.id})
            } 
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
        setDeleteServiceModal(false);
        setIsDischarge(value);
        setServiceModal(value);
        setEdit(value);
        setServiceNote('');
        setPaymentAt(dayjs(new Date()));
        setOperativeResult(dayjs(new Date()));
        setDiscount("");
        discountCheckbox.disable();
        setAmmount(null);
        setSelectedStudent(null);
        setIsEditingTemplate(false);
        setPaymentMethod(null);
        setSelectedCourse(null);
        setSelectedClazz(null);
        setSelectedClazz(null);
        setServiceId(null);
        setStudentCourses([]);
        setDayOfMonth(1);
        setSelectedCollege(null);
        setSelectedItem(null);
        setServiceToDelete('');
        setHaveFile(false);
        setPaymentToEdit({});
    }

    const deleteSelection = () => {
        setFile([]);
        setHaveFile(false);
        setDriveFile(null);
        setFilename("");
    }

    const handleChangeAmmount = (e) => {
        if(!isDischarge) {
            const fixedNumber = e.target.value;
            setAmmount(fixedNumber);
        }else {
            setAmmount(e.target.value);
        }
    }

    const handleChangeNote = (e) => {
        setNote(e.target.value)
     }

    const handleChangePayments = (e) => {
        setPaymentMethod(e.value);
    }

    const handleChangeServiceNote = (e) => {
        setServiceNote(e.target.value);
    }

    const handleChangeTemplates = async (e) => {
        const response = await getTemplate(e.value);
        setPaymentMethod(response.content.type);
        setAmmount(response.content.value);
        setOpenModal(true);
        setIsDischarge(true);
    }

    useEffect(() => {
      console.log(selectedItem);
    }, [selectedItem])
    

    const handleEditService = async (srv) => {
        const method = PAYMENT_OPTIONS.filter(type => type.value == srv.type);
        console.log(method);
        setPaymentMethod(method[0]);
        const item = getItemById(srv.itemId);
        setSelectedItem(item !== undefined ? item : null);
        setDayOfMonth(srv.dayOfMonth)
        setIsDischarge(true);
        setServiceModal(true);      
        setIsEditingTemplate(true);
        setServiceId(srv.id);
        setServiceNote(srv.note ? srv.note : '');
        setAmmount(srv.value ? srv.value : null);
    }

    const addTemplate = async () => {
        try{
            const body = {
                note: serviceNote,
                value: ammount,
                type: paymentMethod.value ? paymentMethod.value : paymentMethod,
                itemId: selectedItem.id,
                dayOfMonth: dayOfMonth
            }
            if(isEditingTemplate) {
                await editService(body, serviceId);
                setDisplay(false);
            }else {
                await newService(body);
                setDisplay(false);
            }
        }catch {
            changeAlertStatusAndMessage(true, 'error', `El servicio no pudo ser ${isEditingTemplate ? 'editado' : 'creado'}... Por favor inténtelo nuevamente.`);
        }
    }

    const handleDeleteService = async () => {
        try{
            await deleteService(serviceId);
            setDisplay(false);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El servicio no pudo ser eliminado... Por favor inténtelo nuevamente.');
            setDisplay(false);
        }
    }

    const openEditPayment = (payment) => {
        setEdit(true);
        setOpenModal(true);
        setNote(payment.note);
        if(payment.isRegistrationPayment){
            setRegistration(payment.isRegistrationPayment);
        }
        if(payment.course) {
            setSelectedCourse(payment.course);
        }
        if (payment.discount != null) {
            discountCheckbox.enable()
            handleChangeDiscount(payment.discount)
        }
        if(payment.clazzId) {
            const classes = clazzes.filter(cls => cls.id === payment.clazzId);
            setSelectedClazz((classes.length > 0) ? {label: classes[0].title, value: classes[0].id} : null);
        }
        if(payment.headquarterId) {
            const college = getHeadquarterById(payment.headquarterId);
            setSelectedCollege(college !== undefined ? {label: college.name, value: college.id} : null);
        }
        if (payment.itemId) {
            const item = getItemById(payment.itemId);
            setSelectedItem(item !== undefined ? item : null);
        }
        if(payment.value < 0) {
            setIsDischarge(true);
            setAmmount(payment.value * -1)
        } else {
            setAmmount(payment.value)
            setSelectedStudent(payment.student);
        }
        const method = PAYMENT_OPTIONS.filter(type => type.value === payment.type);
        setPaymentMethod(method[0]);
        setPaymentAt(dayjs(new Date(payment.at)));
        setOperativeResult(dayjs(new Date(payment.operativeResult)));
        setPaymentToEdit(payment);
    }

    const getValue = () => {
        if(paymentToEdit.value < 0) {
            return ammount * -1;
        } else {
            return ammount;
        }
    }

    const handleInformPayment = async () => {
        setIsLoadingPayment(true);
        const data = {
            itemId: selectedItem?.id,
            clazzId: (edit && selectedClazz !== null) ? selectedClazz.value : selectedClazz?.id,
            headquarterId: (edit && selectedCollege !== null) ? selectedCollege.value :  selectedCollege?.value,
            courseId: (edit && selectedCourse !== null) ? selectedCourse?.id : (isDischarge ? null : selectedCourse?.id),
            type: (edit && paymentMethod !== null) ? paymentMethod.value : paymentMethod,
            fileId: edit ? paymentToEdit.fileId : fileId,
            value: edit ? getValue() : (isDischarge ? (ammount * -1).toFixed(3) : ammount),
            studentId: (edit && selectedStudent !== null) ? selectedStudent.id : (isDischarge ? null : selectedStudent.id),
            note: note,
            at: edit ? paymentAt : paymentAt.$d.getTime(),
            operativeResult: edit ? operativeResult : operativeResult.$d.getTime(),
            driveFileId: driveFile?.id,
            discount: discountCheckbox.value ? discount : null,
            isRegistrationPayment: registration,
            secretaryPayment: (isDischarge && isSecretaryPayment) ? secretaryPaymentValues : null,
        }  
        if (data.itemId != null && data.itemId != undefined) {
            delete data.courseId;
        }
        try{
            if(edit) {
                data.id = paymentToEdit.id;
                await editPayment(data);
            }else {
                await informPayment(data);
            }
            setIsLoadingPayment(false);
            setIsDischarge(false);
            setOpenModal(false);
            setPaymentAt(dayjs(new Date()));
            setOperativeResult(dayjs(new Date()));
            setNote('');
            setPaymentToEdit({});
        }catch(err) {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser informado... Por favor inténtelo nuevamente.')
            console.log(err);
            setIsDischarge(false);
            setIsLoadingPayment(false);
            setPaymentAt(dayjs(new Date()));
            setAmmount(null);
            setOperativeResult(dayjs(new Date()));
            setHaveFile(false);
            setPaymentToEdit({});
        }
        setAmmount(null);
        setSelectedCollege(null);
        setPaymentMethod(null);
        setFileId(null);
        setSelectedCourse(null);
        setSelectedStudent(null);
        setSelectedClazz(null);
        setDiscount("");
        discountCheckbox.disable();
        setHaveFile(false);
        setNote('');
        setEdit(false);
        setSelectedItem(null);
        setPaymentAt(dayjs(new Date()));
        setOpenModal(false);
        setIsDischarge(false);
    }

    const handleChangeDiscount = newValue => {
        if (newValue != "") {
            newValue = parseFloat(newValue);
            newValue = betweenZeroAnd100(newValue);
        }
        setDiscount(newValue)
    }

    const handleChangeStudent = (st) => {
        setStudentCourses([]);
        if(st.courses.length > 0) {
            setStudentCourses(st.courses);
        }
        setSelectedStudent(st);
    }

    useEffect(() => {
      console.log(studentCourses);
    }, [studentCourses])
    

    const getOnlyStudentsOfSameCourse = () => {
        if ((selectedCourse == null) || (studentCourses.length > 0)) {
            return students;
        }
        return students.filter(st => st.courses.some(course => course.id == selectedCourse.id))
    }

    useEffect(() => {
        const currentSecretaryPaymentValues = getSecretaryPaymentDetail();
        if (currentSecretaryPaymentValues)
            setSecretaryPaymentValues(currentSecretaryPaymentValues)
        else
            setSecretaryPaymentValues({ salary: 0, monotributo: 0, extraTasks: 0, extraHours: 0, sac: 0 })
    }, [payments])

    const handleChangeSecretaryPaymentValue = (type, value) => {
        setSecretaryPaymentValues(prev => ({ ...prev, [type]: value }))
    }

    useEffect(() => {
        if (isSecretaryPayment) {
            const salary = parseFloat(secretaryPaymentValues.salary)
            const monotributo = parseFloat(secretaryPaymentValues.monotributo)
            const sac = parseFloat(secretaryPaymentValues.sac)
            const extraHours = parseFloat(secretaryPaymentValues.extraHours)
            const extraTasks = parseFloat(secretaryPaymentValues.extraTasks)
            setAmmount(salary + monotributo + sac + extraHours + extraTasks)
        }
    }, [secretaryPaymentValues, isSecretaryPayment])

    return (
        <>
        <div className="mb-6 md:my-6 md:mx-4">
            <PaymentsTable
                editMode={true}
                editPayment={(payment) => openEditPayment(payment)}
                payments={payments.filter(p => p.verified)}
                isLoading={isLoadingPayments}
                defaultSearchValue={defaultSearchValue}
                defaultTypeValue={defaultTypeValue}
            />
        </div>
        <Modal icon={<PaidIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>{edit ? 'Editando...' : 'Informando...'}</span></>) : <span>{edit ? 'Editar' : 'Informar'}</span>} onClick={handleInformPayment} title={isDischarge ? 'Informar egreso' : 'Informar ingreso'} children={<>
        <div className="grid grid-cols-2 gap-10 pt-6 mb-4">
        {!isDischarge && (<><div className="col-span-2 md:col-span-1">
                <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione la persona que realizó el pago</span>
                <div className="mt-4">
                    <Select
                        onChange={handleChangeStudent}
                        options={getOnlyStudentsOfSameCourse()}
                        value={selectedStudent}
                        getOptionLabel ={(student)=> `${student?.name} ${student?.lastName}`}
                        getOptionValue ={(student)=> student.id}
                    /></div>
            </div>
            {(!selectedClazz && !selectedItem) && (<div className="col-span-2 md:col-span-1">
                <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione el curso que fue abonado</span>
                <div className="mt-4">
                    <Select
                        onChange={setSelectedCourse}
                        options={(studentCourses.length > 0) ? studentCourses : courses}
                        defaultValue={selectedCourse}
                        getOptionLabel ={(course)=> course.title}
                        getOptionValue ={(course)=> course.id}
                    /></div>
            </div>)}
            <div className="col-span-2 pb-1">
                <CustomCheckbox
                    checked={registration}
                    labelOn="Corresponde a un pago de matrícula"
                    labelOff="Corresponde a un pago de matrícula"
                    className=""
                    onChange={() => setRegistration(!registration)}
                />
            </div>
        </>)}
            {(selectedCourse !== null && selectedStudent !== null) && 
                <div className="col-span-2 md:col-span-2">
                    <div className="flex items-center mb-2">
                        <input onChange={discountCheckbox.toggle} name="discount" id="discount" type="checkbox" checked={discountCheckbox.value} value="discount" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                        <label htmlFor="discount" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-900">Aplicar descuento</label>
                    </div>
                    <div>
                        <CommonInput 
                            disabled={!discountCheckbox.value}
                            label="Descuento"
                            name="title"
                            className="block font-bold text-sm text-gray-700 mb-2"
                            type="number" 
                            placeholder="0%" 
                            value={discount}
                            onChange={(e) => handleChangeDiscount(e.target.value)}
                        />
                    </div>
                </div>
            }
            {isDischarge &&
                <div className="col-span-2 pb-1">
                    <CustomCheckbox
                        checked={isSecretaryPayment}
                        labelOn="Corresponde a un pago de secretaria"
                        labelOff="Corresponde a un pago de secretaria"
                        className=""
                        onChange={() => setIsSecretaryPayment(!isSecretaryPayment)}
                    />
                </div>
            }
            {isSecretaryPayment && <>
            <div className="col-span-2 md:col-span-1 pb-1">
                <CommonInput 
                    label="Sueldo"
                    name="Sueldo"
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="Sueldo" 
                    value={secretaryPaymentValues.salary}
                    onChange={(e) => handleChangeSecretaryPaymentValue("salary", e.target.value)}
                />
            </div>
            <div className="col-span-2 md:col-span-1 pb-1">
                <CommonInput 
                    label="Monotributo"
                    name="Monotributo"
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="Monotributo" 
                    value={secretaryPaymentValues.monotributo}
                    onChange={(e) => handleChangeSecretaryPaymentValue("monotributo", e.target.value)}
                />
            </div>
            <div className="col-span-2 md:col-span-1 pb-1">
                <CommonInput 
                    label="Tareas extra"
                    name="Tareas extra"
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="Tareas extra" 
                    value={secretaryPaymentValues.extraTasks}
                    onChange={(e) => handleChangeSecretaryPaymentValue("extraTasks", e.target.value)}
                />
            </div>
            <div className="col-span-2 md:col-span-1 pb-1">
                <CommonInput 
                    label="Horas extra"
                    name="Horas extra"
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="Horas extra" 
                    value={secretaryPaymentValues.extraHours}
                    onChange={(e) => handleChangeSecretaryPaymentValue("extraHours", e.target.value)}
                />
            </div>
            <div className="col-span-2 pb-1">
                <CommonInput 
                    label="S.A.C."
                    name="S.A.C."
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="S.A.C." 
                    value={secretaryPaymentValues.sac}
                    onChange={(e) => handleChangeSecretaryPaymentValue("sac", e.target.value)}
                />
            </div>
            </>}
            <div className="col-span-2 md:col-span-1 pb-1">
                <CommonInput 
                    label="Importe"
                    name="title"
                    className="block font-bold text-sm text-gray-700 mb-2"
                    type="number" 
                    placeholder="Importe" 
                    value={ammount === null ? "": ammount}
                    onChange={handleChangeAmmount}
                />
            </div>
            <div className="col-span-2 md:col-span-1 pb-1">
                <span className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</span>
                <div className="mt-2"><Select onChange={handleChangePayments} defaultValue={edit ? paymentMethod : {}} options={PAYMENT_OPTIONS} /></div>
            </div>
                <div className="col-span-2 md:col-span-2">
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
            <div className="col-span-2 md:col-span-2">
                <span className="block text-gray-700 text-sm font-bold mb-2">Articulo</span>
                <div className="mt-4"><SelectItem onChange={setSelectedItem} value={selectedItem} /></div>
            </div>
            :
            <>
                 {(!selectedClazz && !selectedCourse) && (<div className="col-span-2 md:col-span-2">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Articulo</span>
                    <div className="mt-4"><SelectItem onChange={setSelectedItem} value={selectedItem} /></div>
                </div>)}
                {(!selectedCourse && !selectedItem) && (<div className="col-span-2 md:col-span-2">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Clase</span>
                    <div className="mt-4"><Select onChange={setSelectedClazz} value={selectedClazz} options={clazzes.filter(clazz => !clazz.paymentsVerified)} /></div>
                </div>)}
            </>
            }
            <div className="col-span-2 md:col-span-2">
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
                <div className="col-span-2">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Fecha en que se realizo el pago</span>
                    <div className="mt-4">
                        <DateTimePicker
                        label="Seleccionar fecha"
                        value={paymentAt}
                        onChange={(newValue) => setPaymentAt(newValue)}
                        />
                    </div>
                </div>
                <div className="col-span-2">
                    <span className="block text-gray-700 text-sm font-bold mb-2">Resultado operativo</span>
                    <div className="mt-4">
                        <DateTimePicker
                            label="Seleccionar fecha"
                            value={operativeResult}
                            onChange={(newValue) => setOperativeResult(newValue)}
                        />
                    </div>
                </div>
        </div>
        {(edit && (paymentToEdit.file && (paymentToEdit.file !== null))) && (
        <>
            <label className="block text-gray-700 text-sm font-bold mb-2">
                    Archivo
            </label>
            <div className="my-2 px-3 py-2 bg-orange-50 flex justify-between items-center rounded-sm w-auto">{paymentToEdit.file?.name}<button type="button" className="p-1 rounded-full bg-gray-100 ml-2" onClick={() => setPaymentToEdit({...paymentToEdit, file: null, fileId: null})}><CloseIcon /></button></div>
        </>
        )}
        {!haveFile ? <>
            <span className="block text-gray-700 text-sm font-bold mb-2">Seleccionar comprobante para respaldar la operación</span>
            <div className="flex">
                <StorageIconButton onClick={() => inputFileRef.current.click()} className="mr-2 min-icon-storage" icon="\assets\images\db.png" alt="google drive">Maas Yoga</StorageIconButton>
                <input ref={inputFileRef} type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input>
                {googleDriveEnabled &&
                    <StorageIconButton onClick={handleOpenPicker} className="ml-2 min-icon-storage" icon="\assets\images\gdrive.png" alt="google drive">Google Drive</StorageIconButton>
                }
            </div>
        </>
        :
        (<><span className="block text-gray-700 text-sm font-bold mb-2">Nombre del archivo: {fileName}</span><div className="flex flex-rox gap-4"><button onClick={() => uploadFile(file)} className={`${driveFile !== null && "none"} mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550`}>{isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Subiendo...</span></>) : <span>Subir archivo</span>}</button><button onClick={() => deleteSelection()} className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Eliminar selección</button></div></>)}
        </>} />
        <Modal icon={<ListAltIcon />} open={serviceModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Agregando...</span></>) : <span>Agregar</span>} onClick={addTemplate} title={isEditingTemplate ? 'Editar servicio' : 'Crear nuevo servicio'} children={<>
        <div className="grid gap-10 pt-6 mb-4">
            <div className="grid gap-4 pb-3">
                <div>
                    <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione el Articulo</span>
                    <div><SelectItem onChange={setSelectedItem} value={selectedItem} /></div>
                </div>
                <div>
                    <CommonInput 
                        label="Referencia del servicio"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="text" 
                        placeholder="Referencia" 
                        value={serviceNote}
                        onChange={handleChangeServiceNote}
                    />
                </div>
                <div>
                    <CommonInput 
                        label="Importe"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="number" 
                        placeholder="Importe" 
                        value={ammount === null ? 0 : ammount}
                        onChange={handleChangeAmmount}
                    />    
                </div>
                <div>
                    <CommonInput 
                        label="Día del mes"
                        name="Día del mes"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="number" 
                        placeholder="Día del mes" 
                        value={dayOfMonth}
                        min="0"
                        onChange={(e) => setDayOfMonth(e.target.value)}
                    />
                </div>
                <div>
                    <span className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</span>
                    <div><Select onChange={handleChangePayments} defaultValue={paymentMethod} options={PAYMENT_OPTIONS} /></div>
                </div>
            </div>
        </div>
        </>} />
        <Modal icon={<DeleteIcon />} open={deleteServiceModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteService} title="Eliminar servicio" children={<>
            <div className="grid gap-10 pt-6 mb-4">
                <div>{`Usted esta a punto de eliminar el servicio ${serviceToDelete}. ¿Desea continuar?`}</div>
            </div>
        </>} />
        <div className={`text-gray-700 rounded-2xl px-4 py-3 bg-orange-200 my-6 md:my-10 w-full md:w-3/6 md:mx-4`}>
        <div className="text-xl md:text-2xl flex justify-between items-center"><div className="flex items-center gap-x-2"><span>Servicios</span><button onClick={() => setServiceModal(true)}
                        className="bg-yellow-900 w-8 h-8 rounded-full shadow-lg flex justify-center items-center text-white text-3xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="medium" sx={{ color: orange[50] }} /></span>
            </button></div>{services.length > 0 && (<button onClick={() => setShowSt(!showSt)}>{!showSt && <ExpandMoreIcon />}{showSt && <ExpandLessIcon/>}</button>)}</div>
        {showSt && (<div><hr className="bg-white my-2 h-0.5"/>
          {services.map((tmp, index) => 
            <div className="flex justify-between items-center my-2" key={index}>
                <div className="flex gap-x-2">
                    <span>{tmp.note}</span>
                    <span>{formatPaymentValue(tmp.value)}</span>
                </div>
                <div className="flex gap-x-2">
                    <button onClick={() => handleEditService(tmp)}
                        className="bg-orange-400 w-8 h-8 rounded-full shadow-lg flex justify-center items-center transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105"><span className="font-bold text-sm text-yellow-900"><EditIcon fontSize="medium" /></span>
                    </button>
                    <button className="bg-red-400 w-8 h-8 rounded-full shadow-lg flex justify-center items-center transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105" onClick={() => {
                        setDeleteServiceModal(true);
                        setServiceToDelete(tmp.note);
                        setServiceId(tmp.id);
                        }}><DeleteIcon fontSize="medium" />
                    </button>
                </div>
            </div>
            )}
        </div>)}</div>
        <div className="flex flex-row justify-between">
            <Link to="/home/professor-payments">
                <div
                    className="mr-4 mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap"><span className="font-bold text-sm text-yellow-900">Calcular pagos</span>
                </div>
            </Link>
            <div>
                <button onClick={informDischarge}
                    className="mr-4 mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap"><span className="font-bold text-sm text-yellow-900">Informar egreso</span>
                </button>
                <button onClick={() => setOpenModal(true)}
                    className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap"><span className="font-bold text-sm text-yellow-900">Informar ingreso</span>
                </button>
            </div>
        </div>
        </>
    );
} 