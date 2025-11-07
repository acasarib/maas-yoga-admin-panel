import React, { useContext, useEffect, useState, useRef } from 'react'
import Container from '../components/container'
import { useParams } from 'react-router-dom';
import { Context } from '../context/Context';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import useModal from '../hooks/useModal';
import CustomCheckbox from '../components/checkbox/customCheckbox';
import CommonTextArea from '../components/commonTextArea';
import paymentsService from '../services/paymentsService';
import Select from 'react-select';
import CloseIcon from '@mui/icons-material/Close';
import Modal from '../components/modal';
import SelectItem from '../components/select/selectItem';
import CheckIcon from '@mui/icons-material/Check';
import useDrivePicker from 'react-google-drive-picker'
import CommonInput from '../components/commonInput';
import EditIcon from '@mui/icons-material/Edit';
import PaidIcon from '@mui/icons-material/Paid';
import { formatDateDDMMYY, toMonthsNames, betweenZeroAnd100 } from '../utils';
import StudentCalendar from '../components/calendar/studentCalendar';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import SchoolIcon from '@mui/icons-material/School';
import Spinner from '../components/spinner/spinner';
import PaymentsTable from '../components/paymentsTable';
import DeletePaymentModal from '../components/modal/deletePaymentModal';
import PaymentModal from '../components/modal/paymentModal';
import QRModal from '../components/modal/qrModal';
import { PAYMENT_OPTIONS } from '../constants';
import StorageIconButton from '../components/button/storageIconButton';
import dayjs from 'dayjs';
import RedBudget from '../components/badget/red';
import TaskList from '../components/list/taskList';
import StudentCard from '../components/card/studentCard';
import useToggle from '../hooks/useToggle';
import SelectClass from '../components/select/selectClass';
import SelectColleges from '../components/select/selectColleges';
import SelectStudent from '../components/select/selectStudent';
import SelectCourses from '../components/select/selectCourses';
import StudentDetailSkeleton from '../components/skeleton/studentDetailSkeleton';
import DateTimeInput from '../components/calendar/dateTimeInput';
import DateInput from '../components/calendar/dateInput';
import Label from '../components/label/label';
import ButtonPrimary from '../components/button/primary';
import { COLORS } from '../constants';
import NoDataComponent from '../components/table/noDataComponent';

function Course({ course, student, onOpenQRModal }) {
	const [isOpen, setIsOpen] = useState(false);
    const { updateInscriptionDate, changeAlertStatusAndMessage } = useContext(Context);
	const [editInscriptionDate, setEditInscriptionDate] = useState(false);
	const switchEditInscriptionDate = () => setEditInscriptionDate(!editInscriptionDate);
	const [inputValue, setInputValue] = useState("");
	const handleOnEditInscriptionDate = () => {
		updateInscriptionDate(student.id, course.id, inputValue.$d)
		switchEditInscriptionDate();
	}

	const handleGeneratePayment = async (paymentData) => {
		try {
			// Crear preferencia de pago en MercadoPago
			const response = await paymentsService.createMercadoPagoPreference({
				studentId: student.id,
				courseId: course.id,
				month: paymentData.monthData.month,
				year: paymentData.monthData.year,
				value: paymentData.value,
				discount: paymentData.discount || 0,
                sendNotification: paymentData.notifyOnPayment,
			});
			
			// Manejar diferentes opciones de MercadoPago
			if (paymentData.mercadoPagoOption === 'link') {
				// Copiar el link de pago al portapapeles
				try {
					await navigator.clipboard.writeText(response.link);
					changeAlertStatusAndMessage(true, 'success', 'Copiado al portapapeles');
				} catch (err) {
					console.error('Error al copiar al portapapeles:', err);
					changeAlertStatusAndMessage(true, 'error', 'Error al copiar el enlace');
				}
			} else if (paymentData.mercadoPagoOption === 'qr') {
				// Abrir modal de QR
				onOpenQRModal(response.mercadoPagoPaymentId, {
					monthName: paymentData.monthData.monthName,
					year: paymentData.monthData.year,
					studentName: `${student.name} ${student.lastName}`,
					courseName: course.title
				});
				
				changeAlertStatusAndMessage(true, 'success', 
					`Preferencia de pago creada para ${paymentData.monthData.monthName} ${paymentData.monthData.year}`
				);
			} else if (paymentData.mercadoPagoOption === 'email') {
				// Enviar por email usando el nuevo endpoint
				try {
					const baseUrl = process.env.REACT_APP_BACKEND_HOST;
					const emailResponse = await fetch(`${baseUrl}api/v1/payments/mercadopago/preference/${response.mercadoPagoPaymentId}/email`);
					
					if (!emailResponse.ok) {
						const errorData = await emailResponse.json();
						throw new Error(errorData.error || 'Error al enviar el email');
					}
					
					const emailResult = await emailResponse.json();
					changeAlertStatusAndMessage(true, 'success', 
						`Email enviado a ${emailResult.email} para ${paymentData.monthData.monthName} ${paymentData.monthData.year}`
					);
				} catch (error) {
					console.error('Error sending email:', error);
					changeAlertStatusAndMessage(true, 'error', error.message || 'Error al enviar el email');
				}
			}
			
		} catch (error) {
			console.error('Error generating payment:', error);
			const errorMessage = error?.error || error?.message || 'Error al generar el pago. Por favor inténtelo nuevamente.';
			changeAlertStatusAndMessage(true, 'error', errorMessage);
		}
	}

	useEffect(() => {
		setInputValue(dayjs(course.memberSince));
	}, [course]);

	return (<>
		<ListItemButton onClick={() => setIsOpen(!isOpen)}>
			<ListItemIcon>
				<LocalLibraryIcon />
			</ListItemIcon>
			<ListItemText primary={<>{course.title} {course.isUpToDate === false && <RedBudget className="ml-2">Pago pendiente</RedBudget>}</>} secondary={toMonthsNames(course.startAt, course.endAt)} />
		</ListItemButton>
		<Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
			<div className={`my-2 flex ${editInscriptionDate && "flex-column"}`}>Fecha de inscripción:
				{editInscriptionDate ? (
					<div className="flex mt-4 flex items-center">
						<DateInput
							label="Seleccionar fecha"
							value={inputValue}
							onChange={setInputValue}
						/>
						<span>
							<CheckIcon onClick={handleOnEditInscriptionDate} className="mx-2 cursor-pointer" />
							<CloseIcon onClick={switchEditInscriptionDate} className="cursor-pointer" />
						</span>
					</div>
				)
					: <><span className="ml-1">{formatDateDDMMYY(course.memberSince)}</span>
						<span onClick={switchEditInscriptionDate} className="ml-2 cursor-pointer flex items-center">
							<EditIcon fontSize="small" />
						</span>
					</>}
			</div>
			<StudentCalendar 
				periods={course.periods} 
				allowAddPayment 
				studentData={student}
				onGeneratePayment={handleGeneratePayment}
			/>
		</Collapse>
	</>);
}

const CourseDetail = () => {
	let { studentId } = useParams();
	const { getStudentDetailsById, user, getStudentPayments, changeAlertStatusAndMessage, getPendingPaymentsByCourseFromStudent, editPayment } = useContext(Context);
	const [student, setStudent] = useState(null)
	const [studentPayments, setStudentPayments] = useState(null)
	const [payment, setPayment] = useState(null)
	const [courses, setCourses] = useState([])
	const deletePaymentModal = useModal()
	const [paymentMethod, setPaymentMethod] = useState(null);
    const [note, setNote] = useState('');
    const [isDischarge, setIsDischarge] = useState(false);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrPreferenceId, setQrPreferenceId] = useState(null);
    const [qrPaymentInfo, setQrPaymentInfo] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [paymentAt, setPaymentAt] = useState(dayjs(new Date()));
    const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));
    const discountCheckbox = useToggle()
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedClazz, setSelectedClazz] = useState(null);
	const [discount, setDiscount] = useState("")
    const [edit, setEdit] = useState(false);
    const [registration, setRegistration] = useState(false);
    const [paymentToEdit, setPaymentToEdit] = useState({});
	const [ammount, setAmmount] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const inputFileRef = useRef(null);

	const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = useState(false);
    const [fileName, setFilename] = useState("");

    const [secretaryPaymentValues, setSecretaryPaymentValues] = useState(null)
    const [isSecretaryPayment, setIsSecretaryPayment] = useState(false)
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [openPicker] = useDrivePicker();
    const [driveFile, setDriveFile] = useState(null);
    const [studentCourses, setStudentCourses] = useState([]);
    const googleDriveEnabled = user !== null && "googleDriveCredentials" in user;

	const getData = async () => {
		const student = await getStudentDetailsById(studentId)
		setStudent(student)
	}

	useEffect(() => {
		getData()
	}, []);

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
            clazzId: (selectedClazz !== null) ? selectedClazz.value : selectedClazz?.id,
            headquarterId: (selectedCollege !== null) ? selectedCollege.value :  selectedCollege?.value,
            courseId: (selectedCourse !== null) ? selectedCourse?.id : (isDischarge ? null : selectedCourse?.id),
            type: (paymentMethod !== null) ? (paymentMethod.value || paymentMethod) : paymentMethod,
            fileId: paymentToEdit.fileId,
            value: getValue(),
            studentId: (selectedStudent !== null) ? selectedStudent.id : (isDischarge ? null : selectedStudent.id),
            note: note,
            at: paymentAt,
            operativeResult: operativeResult,
            driveFileId: driveFile?.id,
            discount: discountCheckbox.value ? discount : null,
            isRegistrationPayment: registration,
            secretaryPayment: (isDischarge && isSecretaryPayment) ? secretaryPaymentValues : null,
        }  
        if (data.itemId != null && data.itemId != undefined) {
            delete data.courseId;
        }
        try{
            data.id = paymentToEdit.id;
            await editPayment(data);
			await updatePayments();
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
        const method = PAYMENT_OPTIONS.filter(type => type.value === payment.type);
        setPaymentMethod(method[0]);
        setPaymentAt(dayjs(new Date(payment.at)));
        setOperativeResult(dayjs(new Date(payment.operativeResult)));
        setPaymentToEdit(payment);
    }

	const handleChangeSecretaryPaymentValue = (type, value) => {
        setSecretaryPaymentValues(prev => ({ ...prev, [type]: value }))
    }

	const updatePayments = async () => {
		setStudentPayments(null)
		const fetchData = async () => {
			const studentPayments = await getStudentPayments(studentId)
			setStudentPayments(studentPayments)
		}
		fetchData()
	}

	const getCourses = async () => {
		setCourses(getPendingPaymentsByCourseFromStudent(student))
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

	const handleChangeStudent = (st) => {
        setStudentCourses([]);
        if(st.courses.length > 0) {
            setStudentCourses(st.courses);
        }
        setSelectedStudent(st);
    }

	useEffect(() => {
		if (student == null) return
		updatePayments()
		getCourses()
	}, [student])


	const [tabValue, setTabValue] = useState("1");

	const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

	const onClickDeletePayment = async (payment) => {
		setPayment(payment)
		deletePaymentModal.open()
	}

	const handleOnCloseDeletePaymentModal = () => {
		updatePayments()
		deletePaymentModal.close()
	}

	const handleOpenQRModal = (preferenceId, paymentInfo) => {
		setQrPreferenceId(preferenceId);
		setQrPaymentInfo(paymentInfo);
		setIsQRModalOpen(true);
	}

	const handleCloseQRModal = () => {
		setIsQRModalOpen(false);
		setQrPreferenceId(null);
		setQrPaymentInfo(null);
	}

    const handleFileChange = (e) => {
        if (e.target.files) {
          setFile([...file, e.target.files[0]]);
          setFilename(e.target.files[0].name);
          setHaveFile(true);
        }
    };

    const getOnlyStudentsOfSameCourse = () => {
        if ((selectedCourse == null) || (studentCourses.length > 0)) {
            return null;
        }
        return selectedCourse.students
    }

	return (
		<Container disableTitle className="max-w-full" items={[{ name: "Alumnos", href: "/home/students" }, { name: `${student?.name} ${student?.lastName}`, isLoading: student === null }]}>
			{student !== null ?
				<>
					<h1 className='text-2xl md:text-3xl text-center mb-12'>{student?.name} {student?.lastName}</h1>
					<DeletePaymentModal payment={payment} isOpen={deletePaymentModal.isOpen} onClose={handleOnCloseDeletePaymentModal} />
					<QRModal 
						isOpen={isQRModalOpen} 
						onClose={handleCloseQRModal} 
						preferenceId={qrPreferenceId} 
						paymentInfo={qrPaymentInfo} 
					/>
					<Box sx={{ width: '100%', typography: 'body1' }}>
						<TabContext value={tabValue}>
							<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
								<TabList onChange={handleChangeTabValue}>
									<Tab label="Perfil" value="1" />
									<Tab label="Pagos" value="2" />
									<Tab label="Cursos" value="3" />
									<Tab label="Tareas" value="4" />
								</TabList>
							</Box>
							<TabPanel className="pt-4" value="1">
								<StudentCard student={student} />

							</TabPanel>
							<TabPanel className="pt-4" value="2">
								<PaymentsTable
									editMode
									onClickDeletePayment={onClickDeletePayment}
									editPayment={(payment) => openEditPayment(payment)}
									columnsProps={[
										{
											name: "Profesor",
											hidden: true
										},
									]}
									payments={studentPayments == null ? [] : studentPayments}
									isLoading={studentPayments == null}
								/>
                                {/**TODO: otra vez este componente enorme duplicado. ver el comentario de balanse.jsx */}
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
							</TabPanel>
							<TabPanel className="pt-4" value="3">
                                {courses.length === 0 
                                ? <NoDataComponent Icon={SchoolIcon} title="No hay cursos" subtitle='No se encontraron cursos para este alumno'/>
                                : courses.map((course, i) => <List key={i} component="div" disablePadding>
									    <Course student={student} course={course} onOpenQRModal={handleOpenQRModal} />
								    </List>)
                                }
							</TabPanel>
							<TabPanel className="pt-4" value="4">
								{student?.courseTasks && <TaskList tasks={student.courseTasks} studentId={student.id} courses={courses} getStudent={() => getData()} />}
							</TabPanel>
						</TabContext>
					</Box>
				</>

				: <StudentDetailSkeleton />
			}
		</Container>
	)
}

export default CourseDetail;