import React, { useContext, useEffect, useState } from 'react'
import Container from '../components/container'
import { useParams } from 'react-router-dom';
import { Context } from '../context/Context';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useModal from '../hooks/useModal';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { formatDateDDMMYY, toMonthsNames } from '../utils';
import StudentCalendar from '../components/calendar/studentCalendar';
import { Box, Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import Spinner from '../components/spinner/spinner';
import PaymentsTable from '../components/paymentsTable';
import DeletePaymentModal from '../components/modal/deletePaymentModal';
import dayjs from 'dayjs';
import RedBudget from '../components/badget/red';
import TaskList from '../components/list/taskList';
import StudentCard from '../components/card/studentCard';

function Course({ course, student }) {
	const [isOpen, setIsOpen] = useState(false);
	const { updateInscriptionDate } = useContext(Context);
	const [editInscriptionDate, setEditInscriptionDate] = useState(false);
	const switchEditInscriptionDate = () => setEditInscriptionDate(!editInscriptionDate);
	const [inputValue, setInputValue] = useState("");
	const handleOnEditInscriptionDate = () => {
		updateInscriptionDate(student.id, course.id, inputValue.$d)
		switchEditInscriptionDate();
	}

	useEffect(() => {
		setInputValue(dayjs(course.memberSince));
	}, [course]);


	return (<>
		<ListItemButton onClick={() => setIsOpen(!isOpen)}>
			<ListItemIcon className="text-yellow-900">
				<LocalLibraryIcon />
			</ListItemIcon>
			<ListItemText primary={<>{course.title} {course.isUpToDate === false && <RedBudget className="ml-2">Pago pendiente</RedBudget>}</>} secondary={toMonthsNames(course.startAt, course.endAt)} />
		</ListItemButton>
		<Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
			<div className={`my-2 flex ${editInscriptionDate && "flex-column"}`}>Fecha de inscripción:
				{editInscriptionDate ? (
					<div className="flex mt-4 flex items-center">
						<DatePicker
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
			<StudentCalendar periods={course.periods} />
		</Collapse>
	</>);
}

const CourseDetail = () => {
	let { studentId } = useParams();
	const { getStudentDetailsById, getStudentPayments, getPendingPaymentsByCourseFromStudent } = useContext(Context);
	const [student, setStudent] = useState(null)
	const [studentPayments, setStudentPayments] = useState(null)
	const [payment, setPayment] = useState(null)
	const [courses, setCourses] = useState([])
	const deletePaymentModal = useModal()

	const getData = async () => {
		const student = await getStudentDetailsById(studentId)
		setStudent(student)
	}

	useEffect(() => {
		getData()
	}, []);

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

	return (
		<Container disableTitle className="max-w-full" items={[{ name: "Alumnos", href: "/home/students" }, { name: `${student?.name || ''} ${student?.lastName || ''}` }]}>
			{student !== null ?
				<>
					<h1 className='text-2xl md:text-3xl text-center mb-12'>{student?.name} {student?.lastName}</h1>
					<DeletePaymentModal payment={payment} isOpen={deletePaymentModal.isOpen} onClose={handleOnCloseDeletePaymentModal} />
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
									onClickDeletePayment={onClickDeletePayment}
									columnsProps={[
										{
											name: "Profesor",
											hidden: true
										},
									]}
									payments={studentPayments == null ? [] : studentPayments}
									isLoading={studentPayments == null}
								/>
							</TabPanel>
							<TabPanel className="pt-4" value="3">
								{courses.map((course, i) => <List key={i} component="div" disablePadding>
									<Course student={student} course={course} />
								</List>)}
							</TabPanel>
							<TabPanel className="pt-4" value="4">
								{student?.courseTasks && <TaskList tasks={student.courseTasks} studentId={student.id} courses={courses} getStudent={() => getData()} />}
							</TabPanel>
						</TabContext>
					</Box>
				</>

				: <div className="flex justify-center items-center h-screen">
					<Spinner />
				</div>
			}
		</Container>
	)
}

export default CourseDetail;