import React, { useContext, useEffect, useState } from "react";
import paymentsService from "../../../services/paymentsService";
import CommonInput from "../../../components/commonInput";
import CommonTextArea from "../../../components/commonTextArea";
import Modal from "../../../components/modal";
import PaidIcon from '@mui/icons-material/Paid';
import "react-datepicker/dist/react-datepicker.css";
import { CASH_PAYMENT_TYPE, PAYMENT_OPTIONS } from "../../../constants";
import dayjs from 'dayjs';
import DateTimeInput from '../../calendar/dateTimeInput';
import PaymentsTable from "../../../components/paymentsTable";
import { Context } from "../../../context/Context";
import SelectItem from "../../../components/select/selectItem";
import { Link } from "react-router-dom";
import CloseIcon from '@mui/icons-material/Close';
import StorageIconButton from "../../button/storageIconButton";
import { useRef } from "react";
import useDrivePicker from 'react-google-drive-picker'
import useToggle from "../../../hooks/useToggle";
import { betweenZeroAnd100, fromDDMMYYYYStringToDate, getTimestampsFromMonthYear } from "../../../utils";
import CustomCheckbox from "../../../components/checkbox/customCheckbox";
import Select from "../../select/select";
import SelectClass from "../../select/selectClass";
import SelectColleges from "../../select/selectColleges";
import SelectProfessors from "../../select/selectProfessors";
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import SelectCourses from "../../select/selectCourses";
import SelectStudent from "../../select/selectStudent";
import YellowBudget from "../../badget/yellow";
import ButtonPrimary from "../../button/primary";
import Label from "../../label/label";
import { COLORS } from "../../../constants";
import { Tooltip } from "@mui/material";

export default function PaymentsSection({ defaultSearchValue, defaultTypeValue }) {
    const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = useState(false);
    const [fileName, setFilename] = useState("");
    const { user, informPayment, changeAlertStatusAndMessage, editPayment, getSecretaryPaymentDetail, generateReceipt } = useContext(Context);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [secretaryPaymentValues, setSecretaryPaymentValues] = useState(null)
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isSecretaryPayment, setIsSecretaryPayment] = useState(false)
    const [isClassPayment, setIsClassPayment] = useState(false)
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [searchParams, setSearchParams] = useState(null);
    const showIncomes = useToggle()
    const showDischarges = useToggle()
    const inputFileRef = useRef(null);
    const [fileId, setFileId] = useState(null);
    const [selectedProfessor, setSelectedProfessor] = useState(null);
    const [ammount, setAmmount] = useState(null);
    const addReceipt = useToggle(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [isDischarge, setIsDischarge] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [paymentAt, setPaymentAt] = useState(dayjs(new Date()));
    const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));
    const discountCheckbox = useToggle()
    const [discount, setDiscount] = useState("")
    const [tableSummary, setTableSummary] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedClazz, setSelectedClazz] = useState(null);
    const [edit, setEdit] = useState(false);
    const [registration, setRegistration] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState({});
    const [openPicker] = useDrivePicker();
    const [driveFile, setDriveFile] = useState(null);
    const [studentCourses, setStudentCourses] = useState([]);
    const googleDriveEnabled = user !== null && "googleDriveCredentials" in user;
    const [pageablePayments, setPageablePayments] = useState([]);
    const [resetTable, setResetTable] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [initialData, setInitialData] = useState(null);

    useEffect(() => {
        if (resetTable)
            setResetTable(false)
    }, [resetTable])

    useEffect(() => {
        if (showIncomes.value === true || showDischarges.value === true)
            fetchPayments()
    }, [showIncomes.value, showDischarges.value])

    useEffect(() => {
        fetchPayments();
        setResetTable(true)
    }, []);

    useEffect(() => {
        if (searchParams == null) return
        fetchPayments()
    }, [searchParams]);

    const fetchPayments = async (page = currentPage, size = perPage, params = searchParams) => {
        setIsLoading(true)
        const isOrOperation = params?.isOrOperation || false
        if (params) {
            delete params.isOrOperation;
        }
        if (params) {
            if ("at" in params) {
                const parsedDate = fromDDMMYYYYStringToDate(params.at.value);
                if (parsedDate == null) {
                    params.at.value = `at between ${getTimestampsFromMonthYear(params.at.value)}`
                } else {
                    params.at.value = parsedDate;
                }
            }
            if ('operativeResult' in params) {
                const parsedDate = fromDDMMYYYYStringToDate(params.operativeResult.value);
                if (parsedDate == null) {
                    params.operativeResult.value = `operativeResult between ${getTimestampsFromMonthYear(params.operativeResult.value)}`
                } else {
                    params.operativeResult.value = parsedDate;
                }
            }
        }
        if (defaultTypeValue) {
            if (params === undefined || params === null) {
                params = {}
            }
            params[defaultTypeValue] = {
                value: defaultSearchValue,
                operation: 'eq'
            }
        }

        if (showIncomes.value) {
            if (params == null) params = {}
            params.value = {
                value: 0,
                operation: 'gt',
            }
        }
        if (showDischarges.value) {
            if (params == null) params = {}
            params.value = {
                value: 0,
                operation: 'lt',
            }
        }
        
        const data = await paymentsService.getAllPaymentsVerified(page, size, params, isOrOperation);
        if (initialData == null) {
            setInitialData(data)
        }
        setIsLoading(false)
        setPageablePayments(data.data);
        setTotalRows(data.totalItems);
        setTableSummary(data);
    }

    const handleOnSearch = async (searchParams) => {
        clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(async () => {
            let searchBy = searchParams.byAllFields ? 'all' : searchParams.serverProp;
            let searchValue = searchParams.searchValue;
            let searchOperation = searchParams.serverOperation;
            if (searchValue === "") {//Sin filtro
                searchValue = undefined;
                searchBy = undefined;
                setSearchParams({ isOrOperation: false });
            } else if (!searchParams.byAllFields) {// Un filtro solo
                const params = {
                    isOrOperation: false,
                    [searchBy]: {
                        value: searchValue,
                        operation: searchOperation,
                    }
                }
                setSearchParams(params);
            } else { // Filtro Todos
                const params = { isOrOperation: true, all: searchValue }
                setSearchParams(params);
            }
        }, 500)); // Espera 500ms después de que el usuario deje de escribir
         
        
    }

    const handlePageChange = page => {
        fetchPayments(page);
        setCurrentPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        fetchPayments(page, newPerPage);
        setPerPage(newPerPage);
    };
    

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
        setIsDischarge(value);
        setEdit(value);
        setPaymentAt(dayjs(new Date()));
        setOperativeResult(dayjs(new Date()));
        setDiscount("");
        discountCheckbox.disable();
        setAmmount(null);
        setSelectedStudent(null);
        setPaymentMethod(null);
        setSelectedCourse(null);
        setSelectedClazz(null);
        setSelectedClazz(null);
        setStudentCourses([]);
        setSelectedCollege(null);
        setSelectedItem(null);
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
            const classes = payment.clazz;
            setSelectedClazz((classes.length > 0) ? {label: classes[0].title, value: classes[0].id} : null);
        }
        if (payment.itemId) {
            const item = payment.item;
            setSelectedItem(item !== undefined ? item : null);
        }
        if(payment.value < 0) {
            setIsDischarge(true);
            setAmmount(payment.value * -1)
        } else {
            setAmmount(payment.value)
            setSelectedStudent(payment.student);
        }
        if (payment.headquarter) {
            setSelectedCollege(payment.headquarter);
        } else {
            setSelectedCollege(null);
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

    const downloadReceipt = async (paymentId) => {
        try {
            const blob = await generateReceipt(paymentId);
            addReceipt.disable();

            if (!blob) throw new Error('Blob indefinido');
    
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            link.download = `recibo-${paymentId}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al descargar el recibo:', error);
        }
    };

    const handleInformPayment = async () => {        
        setIsLoadingPayment(true);
        const data = {
            itemId: selectedItem?.id,
            clazzId: (edit && selectedClazz !== null) ? selectedClazz.value : selectedClazz?.id,
            headquarterId: selectedCollege?.id ?? selectedCollege?.value ?? null,
            courseId: (edit && selectedCourse !== null) ? selectedCourse?.id : (isDischarge ? null : selectedCourse?.id),
            type: (edit && paymentMethod !== null) ? (paymentMethod.value || paymentMethod) : paymentMethod,
            fileId: edit ? paymentToEdit.fileId : fileId,
            value: edit ? getValue() : (isDischarge ? (ammount * -1).toFixed(3) : ammount),
            studentId: (edit && selectedStudent !== null) ? selectedStudent.id : (isDischarge ? null : selectedStudent?.id),
            professorId: selectedProfessor !== null ? selectedProfessor.id : (edit && paymentToEdit?.professorId !== null ? paymentToEdit.professorId : null),
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
            const sendReceipt = addReceipt.value && selectedStudent?.email;
            
            if(edit) {
                data.id = paymentToEdit.id;
                if(addReceipt.value) {
                    await downloadReceipt(data.id);
                }
                await editPayment(data, sendReceipt);
            }else {
                const savedPayment = await informPayment(data, sendReceipt);
                if(addReceipt.value) {
                    await downloadReceipt(savedPayment.id);
                }
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
        setRegistration(false);
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
        if(st?.courses?.length > 0) {
            setStudentCourses(st.courses);
        }
        setSelectedStudent(st);
    }

    const getOnlyStudentsOfSameCourse = () => {
        if ((selectedCourse == null) || (studentCourses.length > 0)) {
            return null;
        }
        return selectedCourse.students
    }

    const handleChangeSecretaryPaymentValue = (type, value) => {
        setSecretaryPaymentValues(prev => ({ ...prev, [type]: value }))
    }

    useEffect(() => {
        const getSecretaryPaymentValues = async () => {
            const currentSecretaryPaymentValues = await getSecretaryPaymentDetail();
            if (currentSecretaryPaymentValues)
                setSecretaryPaymentValues(currentSecretaryPaymentValues)
            else
                setSecretaryPaymentValues({ salary: 0, monotributo: 0, extraTasks: 0, extraHours: 0, sac: 0 })
            
        }
        if (isSecretaryPayment) {
            getSecretaryPaymentValues()
        }
    }, [isSecretaryPayment])

    useEffect(() => {
        if (secretaryPaymentValues == null || secretaryPaymentValues == undefined) return
        const salary = parseFloat(secretaryPaymentValues.salary)
        const monotributo = parseFloat(secretaryPaymentValues.monotributo)
        const sac = parseFloat(secretaryPaymentValues.sac)
        const extraHours = parseFloat(secretaryPaymentValues.extraHours)
        const extraTasks = parseFloat(secretaryPaymentValues.extraTasks)
        setAmmount(salary + monotributo + sac + extraHours + extraTasks)
    }, [secretaryPaymentValues])

    return (
        <>
        <div>
            <PaymentsTable
                onSwitchDischarges={showIncomes.toggle}
                onSwitchIncomes={showDischarges.toggle}
                pageableProps={{
                    resetTable,
                    handleCustomSearchValue: handleOnSearch,
                    paginationTotalRows: totalRows,
                    onChangePage: handlePageChange,
                    onChangeRowsPerPage: handlePerRowsChange,
                    paginationDefaultPage: currentPage,
                }}
                summary={tableSummary}
                editMode={true}
                editPayment={(payment) => openEditPayment(payment)}
                payments={pageablePayments}
                isLoading={isLoading}
                defaultSearchValue={defaultSearchValue}
                defaultTypeValue={defaultTypeValue}
            />
        </div>
        <Modal
            icon={<PaidIcon />}
            open={openModal}
            setDisplay={setDisplay}
            size="large"
            buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>{edit ? 'Editando...' : 'Informando...'}</span></>) : <span>{edit ? 'Editar' : 'Informar'}</span>}
            onClick={handleInformPayment}
            title={isDischarge ? 'Informar egreso' : 'Informar ingreso'}
        >
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-6">
        {!isDischarge && (<>
            <div>
                <Label htmlFor="student">Seleccione la persona que realizó el pago</Label>
                <SelectStudent
                    name="student"
                    onChange={handleChangeStudent}
                    options={getOnlyStudentsOfSameCourse()}
                    value={selectedStudent}
                />
            </div>
            {(!selectedClazz && !selectedItem) && (<div>
                <Label htmlFor="course">Seleccione el curso que fue abonado</Label>
                <SelectCourses
                    name="course"
                    onChange={setSelectedCourse}
                    value={selectedCourse}
                    options={(studentCourses.length > 0) ? studentCourses : null}
                    defaultValue={selectedCourse}
                />
            </div>)}
            <div className="col-span-2">
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
                    <CustomCheckbox
                        checked={discountCheckbox.value}
                        label="Aplicar descuento"
                        onChange={discountCheckbox.toggle}
                    />
                    <div>
                        <CommonInput 
                            disabled={!discountCheckbox.value}
                            label="Descuento"
                            name="discount"
                            type="number" 
                            symbol='%'
                            placeholder="0" 
                            value={discount}
                            onChange={(e) => handleChangeDiscount(e.target.value)}
                        />
                    </div>
                </div>
            }
            {isDischarge &&
                <div className="col-span-2">
                    <CustomCheckbox
                        checked={isSecretaryPayment}
                        labelOn="Corresponde a un pago de secretaria"
                        labelOff="Corresponde a un pago de secretaria"
                        className=""
                        onChange={() => setIsSecretaryPayment(!isSecretaryPayment)}
                    />
                </div>
            }
            <div className="col-span-2">
                <CustomCheckbox
                    checked={isClassPayment}
                    labelOn="Corresponde al pago de una clase"
                    labelOff="Corresponde al pago de una clase"
                    className=""
                    onChange={() => setIsClassPayment(!isClassPayment)}
                />
            </div>
            {isSecretaryPayment && 
            <div className="flex flex-col gap-4 sm:grid sm:col-span-2 sm:grid-cols-2">
                <CommonInput 
                    label="Sueldo"
                    name="Sueldo"
                    type="number" 
                    currency
                    placeholder="Sueldo" 
                    value={secretaryPaymentValues?.salary}
                    onChange={(e) => handleChangeSecretaryPaymentValue("salary", e.target.value)}
                />
                <CommonInput 
                    label="Monotributo"
                    name="Monotributo"
                    type="number" 
                    currency
                    placeholder="Monotributo" 
                    value={secretaryPaymentValues?.monotributo}
                    onChange={(e) => handleChangeSecretaryPaymentValue("monotributo", e.target.value)}
                />
                <CommonInput 
                    label="Tareas extra"
                    name="Tareas extra"
                    type="number" 
                    currency
                    placeholder="Tareas extra" 
                    value={secretaryPaymentValues?.extraTasks}
                    onChange={(e) => handleChangeSecretaryPaymentValue("extraTasks", e.target.value)}
                />
                <CommonInput 
                    label="Horas extra"
                    name="Horas extra"
                    type="number" 
                    currency
                    placeholder="Horas extra" 
                    value={secretaryPaymentValues?.extraHours}
                    onChange={(e) => handleChangeSecretaryPaymentValue("extraHours", e.target.value)}
                />
                <CommonInput 
                    label="S.A.C."
                    name="S.A.C."
                    type="number" 
                    currency
                    placeholder="S.A.C." 
                    value={secretaryPaymentValues?.sac}
                    onChange={(e) => handleChangeSecretaryPaymentValue("sac", e.target.value)}
                />
            </div>}
            {isClassPayment && 
                <div className="col-span-2 md:col-span-2">
                    <Label htmlFor="professor">Profesor</Label>
                    <SelectProfessors
                        name="professor"
                        value={selectedProfessor}
                        onChange={setSelectedProfessor}
                        styles={{ menu: provided => ({ ...provided, zIndex: 2 }) }}
                    />
                </div>
            }
            <div className="col-span-2 md:col-span-1">
                <CommonInput 
                    label="Importe"
                    currency
                    name="title"
                    type="number" 
                    placeholder="Importe" 
                    value={ammount === null ? "": ammount}
                    onChange={handleChangeAmmount}
                />
            </div>
            <div className="col-span-2 md:col-span-1">
                <Label htmlFor="paymentType">Modo de pago</Label>
                <Select
                    name="paymentType"
                    onChange={handleChangePayments}
                    defaultValue={edit ? paymentMethod : {}}
                    options={PAYMENT_OPTIONS}
                />
            </div>
            {(paymentMethod === CASH_PAYMENT_TYPE || paymentMethod?.value === CASH_PAYMENT_TYPE) && (
                <div className="col-span-2">
                    <div className="flex items-center">
                        <CustomCheckbox
                            label="Generar recibo"
                            name="addReceipt"
                            checked={addReceipt.value}
                            onChange={addReceipt.toggle}
                        />
                        <Tooltip style={{ marginLeft: "-11px" }} className="text-gray-500" title="Se generará un comprobante de pago y el mismo será enviado por email al alumno que realizó el pago">
                            <InfoIcon fontSize="small" />
                        </Tooltip>
                    </div>
                    {!selectedStudent?.email && (
                        <YellowBudget className="mt-2 w-full">
                            <WarningIcon fontSize="small" className="mr-2" />No se encontro email asociado al alumno, por lo que se podrá descargar el recibo pero el mismo no será enviado por correo.
                        </YellowBudget>
                    )}
                </div>
            )}
            <div className="col-span-2 md:col-span-2">
                <Label htmlFor="headquarter">Sede</Label>
                <SelectColleges
                    name="headquarter"
                    value={selectedCollege}
                    onChange={setSelectedCollege}
                    styles={{ menu: provided => ({ ...provided, zIndex: 2 }) }}
                />
            </div>
            {isDischarge ? (
                <div className="col-span-2 md:col-span-2">
                    <Label htmlFor="category">Articulo</Label>
                    <SelectItem name="category" onChange={setSelectedItem} value={selectedItem} />
                </div>
            ) : (
                <>
                    {(!selectedClazz && !selectedCourse) && (
                        <div className="col-span-2 md:col-span-2">
                            <Label htmlFor="category">Articulo</Label>
                            <SelectItem name="category" onChange={setSelectedItem} value={selectedItem} />
                        </div>
                    )}
                    {(!selectedCourse && !selectedItem) && (
                        <div className="col-span-2 md:col-span-2">
                            <Label htmlFor="clazz">Clase</Label>
                            <SelectClass
                                name="clazz"
                                onChange={setSelectedClazz}
                                value={selectedClazz}
                                getOptionValue={(clazz) => clazz.id}
                            />
                        </div>
                    )}
                </>
            )}
            <div className="col-span-2 md:col-span-2">
                <CommonTextArea
                    label="Nota"
                    name="note"
                    type="textarea"
                    placeholder="Nota"
                    value={note}
                    onChange={handleChangeNote}
                />
            </div>
            <div className="col-span-2">
                <DateTimeInput
                    className="w-full sm:w-auto"
                    name="paymentAt"
                    label="Fecha en que se realizo el pago"
                    value={paymentAt}
                    onChange={(newValue) => setPaymentAt(newValue)}
                />
            </div>
            <div className="col-span-2">
                <DateTimeInput
                    className="w-full sm:w-auto"
                    name="operativeResult"
                    label="Resultado operativo"
                    value={operativeResult}
                    onChange={(newValue) => setOperativeResult(newValue)}
                />
            </div>
            {(edit && paymentToEdit.file && paymentToEdit.file !== null) && (
                <div className="col-span-2">
                    <div className="sm:w-6/12">
                        <Label>Archivo</Label>
                        <div style={{ backgroundColor: COLORS.primary[50] }} className="my-2 px-3 py-2 flex justify-between items-center rounded-sm w-auto">
                            {paymentToEdit.file?.name}
                            <button
                                type="button"
                                className="p-1 rounded-full bg-gray-100 ml-2"
                                onClick={() => setPaymentToEdit({ ...paymentToEdit, file: null, fileId: null })}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {!haveFile ? (
                <div>
                    <Label>Seleccionar comprobante para respaldar la operación</Label>
                    <div className="flex">
                        <StorageIconButton onClick={() => inputFileRef.current.click()} className="min-icon-storage" icon="\assets\images\db.png" alt="maas yoga">Maas Yoga</StorageIconButton>
                        <input ref={inputFileRef} type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange} />
                        {googleDriveEnabled && (
                            <StorageIconButton onClick={handleOpenPicker} className="ml-2 min-icon-storage" icon="\assets\images\gdrive.png" alt="google drive">Google Drive</StorageIconButton>
                        )}
                    </div>
                </div>
            ) : (
                <div>
                    <Label>Nombre del archivo: {fileName}</Label>
                    <div className="flex flex-rox gap-4">
                        <ButtonPrimary onClick={() => uploadFile(file)} className={`${driveFile !== null && "none"} mt-4 w-full sm:w-40 h-auto`}>
                            {isLoading ? (
                                <>
                                    <i className="fa fa-circle-o-notch fa-spin mr-2"></i>
                                    <span>Subiendo...</span>
                                </>
                            ) : (
                                <span>Subir archivo</span>
                            )}
                        </ButtonPrimary>

                        <ButtonPrimary onClick={() => deleteSelection()} className="mt-4 w-full sm:w-40 h-auto">
                            Eliminar selección
                        </ButtonPrimary>
                    </div>
                </div>
            )}
        </div>
        </Modal>


        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-4">
            <Link to="/home/professor-payments">
                <ButtonPrimary className={"w-full sm:w-auto"}>Calcular pagos</ButtonPrimary>
            </Link>
            <div className="flex gap-4">
                <ButtonPrimary className={"sm:mr-4 w-full sm:w-auto"} onClick={informDischarge}>Informar egreso</ButtonPrimary>
                <ButtonPrimary className={"w-full sm:w-auto"} onClick={() => setOpenModal(true)}>Informar ingreso</ButtonPrimary>
            </div>
        </div>
        </>
    );
} 
