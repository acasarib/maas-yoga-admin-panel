import React, { useState, useRef, useContext, useEffect } from "react";
import Chart from "../components/chart";
import ChartSelector from "../components/chartSelector";
import ChartFilterModal from "../components/chart/chartFilterModal";
import PaymentsTable from "../components/paymentsTable";
import Container from "../components/container";
import dayjs from 'dayjs';
import CustomCheckbox from "../components/checkbox/customCheckbox";
import StorageIconButton from "../components/button/storageIconButton";
import useDrivePicker from 'react-google-drive-picker'
import useToggle from "../hooks/useToggle";
import { PAYMENT_OPTIONS } from "../constants";
import { betweenZeroAnd100 } from "../utils";
import paymentsService from "../services/paymentsService";
import { Context } from "../context/Context";
import CloseIcon from '@mui/icons-material/Close';
import PaidIcon from '@mui/icons-material/Paid';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Modal from "../components/modal";
import SelectItem from "../components/select/selectItem";
import CommonInput from "../components/commonInput";
import CommonTextArea from "../components/commonTextArea";
import Select from "../components/select/select";
import SelectClass from "../components/select/selectClass";
import SelectColleges from "../components/select/selectColleges";
import SelectStudent from "../components/select/selectStudent";
import SelectCourses from "../components/select/selectCourses";
import DateTimeInput from "../components/calendar/dateTimeInput";
import Label from "../components/label/label";
import ButtonPrimary from "../components/button/primary";
import YellowBudget from "../components/badget/yellow";
import { COLORS } from "../constants";

export default function Balance(props) {

    const [currentChartSelected, setCurrentChartSelected] = useState("year");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customChainFilters, setCustomChainFilters] = useState([]);
    const [chartByCreatedAt, setChartByCreatedAt] = useState(false);
    const [chartByOpResult, setChartByOpResult] = useState(false);
    const [payments, setPayments] = useState([]);
    const [currentPeriod, setCurrentPeriod] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const inputFileRef = useRef(null);
    const [ammount, setAmmount] = useState(null);
    const [isSecretaryPayment, setIsSecretaryPayment] = useState(false)
    const [openPicker] = useDrivePicker();
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [isDischarge, setIsDischarge] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [haveFile, setHaveFile] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isLoadingPayments = useToggle()
    const [fileName, setFilename] = useState("");
    const [file, setFile] = useState([]);
    const [paymentAt, setPaymentAt] = useState(dayjs(new Date()));
    const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));
    const discountCheckbox = useToggle()
    const [selectedItem, setSelectedItem] = useState(null);
    const [discount, setDiscount] = useState("")
    const [selectedClazz, setSelectedClazz] = useState(null);
    const [edit, setEdit] = useState(false);
    const [registration, setRegistration] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [studentCourses, setStudentCourses] = useState([]);
    const [secretaryPaymentValues, setSecretaryPaymentValues] = useState(null)
    const [driveFile, setDriveFile] = useState(null);
    const [paymentToEdit, setPaymentToEdit] = useState({});
    const [fileId, setFileId] = useState(null);
    const { user, changeAlertStatusAndMessage, editPayment, informPayment } = useContext(Context);
    const googleDriveEnabled = user !== null && "googleDriveCredentials" in user;

    const switchModal = () => setIsModalOpen(!isModalOpen);

    const handleChangeSecretaryPaymentValue = (type, value) => {
        setSecretaryPaymentValues(prev => ({ ...prev, [type]: value }))
    }

    const handleChangeSelector = selection => {
        if (selection === "custom")
            switchModal();
        else
            setCurrentChartSelected(selection);
    }

    const getOnlyStudentsOfSameCourse = () => {
        if ((selectedCourse == null) || (studentCourses.length > 0)) {
            return null;
        }
        return selectedCourse.students
    }

    const handleChangeStudent = (st) => {
        setStudentCourses([]);
        if(st.courses.length > 0) {
            setStudentCourses(st.courses);
        }
        setSelectedStudent(st);
    }
    
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

    const deleteSelection = () => {
        setFile([]);
        setHaveFile(false);
        setDriveFile(null);
        setFilename("");
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
            studentId: (edit && selectedStudent !== null) ? selectedStudent.id : (isDischarge ? null : selectedStudent?.id),
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

    const handleChangeAmmount = (e) => {
        if(!isDischarge) {
            const fixedNumber = e.target.value;
            setAmmount(fixedNumber);
        }else {
            setAmmount(e.target.value);
        }
    }

    const onApplyFilter = (chainFilters) => {
        setCustomChainFilters(chainFilters);
        setCurrentChartSelected("custom");
        switchModal();
    }

    const handleChangeDiscount = newValue => {
        if (newValue != "") {
            newValue = parseFloat(newValue);
            newValue = betweenZeroAnd100(newValue);
        }
        setDiscount(newValue)
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
            const classes = payment.clazz
            setSelectedClazz((classes.length > 0) ? {label: classes[0].title, value: classes[0].id} : null);
        }
        if (payment.itemId) {
            const item = payment.item
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

    const handleOnDeletePayment = paymentId => setPayments(current => current.filter(p => p.id !== paymentId));

    const buildQueryForExport = () => {
        const field = chartByCreatedAt ? "createdAt" : (chartByOpResult ? "operativeResult" : "at");
        
        if (currentChartSelected === "custom") {
            return customChainFilters;
        } else if (currentPeriod) {
            // Use the period from the chart (handles year, month, week with navigation)
            return `${field} between ${currentPeriod.from}:${currentPeriod.to}`;
        }
        
        // Fallback to current period if no period is set yet
        const now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        
        if (currentChartSelected === "year") {
            const startOfYearDate = new Date(now.getFullYear(), 0, 1);
            startOfYearDate.setSeconds(0);
            startOfYearDate.setMilliseconds(0);
            const startOfYear = startOfYearDate.getTime();
            const endOfYearDate = new Date(now.getFullYear(), 11, 31);
            endOfYearDate.setSeconds(59);
            endOfYearDate.setMilliseconds(999);
            const endOfYear = endOfYearDate.getTime();
            return `${field} between ${startOfYear}:${endOfYear}`;
        } else if (currentChartSelected === "month") {
            const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfMonthDate.setSeconds(0);
            startOfMonthDate.setMilliseconds(0);
            const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            endOfMonthDate.setSeconds(59);
            endOfMonthDate.setMilliseconds(999);
            const startOfMonth = startOfMonthDate.getTime();
            const endOfMonth = endOfMonthDate.getTime();
            return `${field} between ${startOfMonth}:${endOfMonth}`;
        } else if (currentChartSelected === "week") {
            let prevMonday = new Date(now);
            prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() == 1 ? 7 : (prevMonday.getDay() + (7 - 1)) % 7 ));
            prevMonday.setHours(0);
            prevMonday.setMinutes(0);
            prevMonday.setSeconds(0);
            let until = new Date();
            until.setDate(prevMonday.getDate() + 6);
            until.setHours(23);
            until.setMinutes(59);
            until.setSeconds(59);
            until.setMilliseconds(999);
            return `${field} between ${prevMonday.getTime()}:${until.getTime()}`;
        }
        return "";
    };

    const handleExportPayments = async () => {
        try {
            const query = buildQueryForExport();
            const response = await paymentsService.exportPayments(query);
            
            // Create blob and download
            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const now = new Date();
            const filename = `balance-rubros-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}.xlsx`;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
            changeAlertStatusAndMessage(true, 'success', 'Archivo exportado exitosamente!');
        } catch (error) {
            console.error('Error al exportar:', error);
            changeAlertStatusAndMessage(true, 'error', 'Error al exportar el archivo');
        }
    };
    
    return(
        <>
            <Container title="Balance">
                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-4 mb-14">
                    <div className="col-span-1">
                        <ChartSelector allowCustom currentChartSelected={currentChartSelected} onChange={handleChangeSelector}/>
                    </div>
                    <div className="col-span-3">
                        <Chart
                            chartByCreatedAt={chartByCreatedAt}
                            setChartByCreatedAt={setChartByCreatedAt}
                            chartByOpResult={chartByOpResult}
                            setChartByOpResult={setChartByOpResult}
                            customChainFilters={customChainFilters}
                            currentChartSelected={currentChartSelected}
                            onChangeData={data => setPayments(data)}
                            onChangePeriod={period => setCurrentPeriod(period)}
                            isLoadingPayments={isLoadingPayments}    
                        />
                    </div>
                </div>
                <div className="flex justify-end mb-4">
                    <ButtonPrimary
                        disabled={payments.length === 0 || isLoadingPayments.value}
                        onClick={handleExportPayments}
                        className="flex justify-center items-center"
                    >
                        <FileDownloadIcon className="mr-1" fontSize="small" />
                        Exportar
                    </ButtonPrimary>
                </div>
                <PaymentsTable editMode={true} dateField={chartByCreatedAt ? "createdAt" : (chartByOpResult ? 'operativeResult' : "at")} className="mt-4" onDelete={handleOnDeletePayment} editPayment={(payment) => openEditPayment(payment)} payments={payments} isLoading={isLoadingPayments.value}/>

                {/* TODO: refactorizar este modal en uno solo que esta duplicado y es dificil de mantener. O mejor si hacemos un link y unificamos todo en una vista */}
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
                                        placeholder="0%" 
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
                                onChange={(e) => setPaymentMethod(e.value)}
                                defaultValue={edit ? paymentMethod : {}}
                                options={PAYMENT_OPTIONS}
                            />
                        </div>
                            <div className="col-span-2 md:col-span-2">
                                <Label htmlFor="headquarter">Sede</Label>
                                <SelectColleges
                                    name="headquarter"
                                    value={selectedCollege}
                                    onChange={setSelectedCollege}
                                    styles={{ menu: provided => ({ ...provided, zIndex: 2 }) }}
                                />
                            </div>
                        {isDischarge ?
                        <div className="col-span-2 md:col-span-2">
                            <Label htmlFor="category">Articulo</Label>
                            <SelectItem name="category" onChange={setSelectedItem} value={selectedItem} />
                        </div>
                        :
                        <>
                            {(!selectedClazz && !selectedCourse) && (<div className="col-span-2 md:col-span-2">
                                <Label htmlFor="category">Articulo</Label>
                                <SelectItem name="category" onChange={setSelectedItem} value={selectedItem} />
                            </div>)}
                            {(!selectedCourse && !selectedItem) && (<div className="col-span-2 md:col-span-2">
                                <Label htmlFor="clazz">Clase</Label>
                                <SelectClass
                                    name="clazz"
                                    onChange={setSelectedClazz}
                                    value={selectedClazz}
                                    getOptionValue ={(clazz)=> clazz.id}
                                />
                            </div>)}
                        </>
                        }
                        <div className="col-span-2 md:col-span-2">
                            <CommonTextArea 
                                label="Nota"
                                name="note"
                                type="textarea" 
                                placeholder="Nota" 
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                            <div className="col-span-2">
                                <Label htmlFor="paymentAt">Fecha en que se realizo el pago</Label>
                                <div className="mt-4">
                                    <DateTimeInput
                                        className="w-full sm:w-auto"
                                        name="paymentAt"
                                        label="Seleccionar fecha"
                                        value={paymentAt}
                                        onChange={(newValue) => setPaymentAt(newValue)}
                                    />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <Label htmlFor="operativeResult">Resultado operativo</Label>
                                <div className="mt-4">
                                    <DateTimeInput
                                        className="w-full sm:w-auto"
                                        name="operativeResult"
                                        label="Seleccionar fecha"
                                        value={operativeResult}
                                        onChange={(newValue) => setOperativeResult(newValue)}
                                    />
                                </div>
                            </div>
                        {(edit && (paymentToEdit.file && (paymentToEdit.file !== null))) && (
                        <>
                            <Label>Archivo</Label>
                            <div style={{ backgroundColor: COLORS.primary[50] }} className="my-2 px-3 py-2 flex justify-between items-center rounded-sm w-auto">{paymentToEdit.file?.name}<button type="button" className="p-1 rounded-full bg-gray-100 ml-2" onClick={() => setPaymentToEdit({...paymentToEdit, file: null, fileId: null})}><CloseIcon /></button></div>
                        </>
                        )}
                        {!haveFile 
                        ? <div>
                            <Label>Seleccionar comprobante para respaldar la operación</Label>
                            <div className="flex">
                                <StorageIconButton onClick={() => inputFileRef.current.click()} className="min-icon-storage" icon="\assets\images\db.png" alt="maas yoga">Maas Yoga</StorageIconButton>
                                <input ref={inputFileRef} type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input>
                                {googleDriveEnabled &&
                                    <StorageIconButton onClick={handleOpenPicker} className="ml-2 min-icon-storage" icon="\assets\images\gdrive.png" alt="google drive">Google Drive</StorageIconButton>
                                }
                            </div>
                        </div>
                        : <div>
                            <Label>Nombre del archivo: {fileName}</Label>
                            <div className="flex flex-rox gap-4">
                                <ButtonPrimary onClick={() => uploadFile(file)} className={`${driveFile !== null && "none"} mt-4 w-full sm:w-40 h-auto`}>
                                    {isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Subiendo...</span></>) : <span>Subir archivo</span>}
                                </ButtonPrimary>

                                <ButtonPrimary onClick={() => deleteSelection()} className="mt-4 w-full sm:w-40 h-auto">
                                    Eliminar selección
                                </ButtonPrimary>
                            </div>
                        </div>
                        }
                    </div>
            </Modal>
            </Container>
            <ChartFilterModal isOpen={isModalOpen} closeModal={switchModal} onApplyFilter={onApplyFilter} />
        </>
    );
} 