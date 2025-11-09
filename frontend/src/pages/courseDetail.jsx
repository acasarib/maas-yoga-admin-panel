import React, { useContext, useEffect, useState } from 'react'
import Container from '../components/container'
import { useParams } from 'react-router-dom';
import { Context } from '../context/Context';
import PaidIcon from '@mui/icons-material/Paid';
import AddTaskIcon from '@mui/icons-material/AddTask';
import useModal from '../hooks/useModal';
import { formatDateDDMMYY, getMonthNameByMonthNumber, prettyCriteria, randomColor, series } from '../utils';
import { STUDENT_STATUS } from '../constants';
import { COLORS } from '../constants';
import SimpleCard from '../components/card/simpleCard';
import SliderMonthCard from '../components/card/sliderMonthCard';
import Table from '../components/table';
import StudentCoursesInfo from '../components/section/courses/studentCoursesInfo';
import StudentCalendar from '../components/calendar/studentCalendar';
import Modal from '../components/modal';
import ButtonPrimary from '../components/button/primary';
import SuspensionsModal from '../components/modal/suspensionsModal';
import { Box, Tab } from '@mui/material';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import TasksTable from '../components/table/tasksTable';
import TaskModal from '../components/courses/taskModal';
import CopyTaskModal from '../components/courses/copyTaskModal';
import CourseDetailModal from '../components/modal/courseDetailModal';
import Link from '../components/link/link';
import CourseDetailSkeleton from '../components/skeleton/courseDetailSkeleton';

const ProfessorCalendar = ({ coursePeriods }) => Object.keys(coursePeriods).map(year => <div className='mb-2' key={year}>
	<div className='font-medium text-xl mb-1'>{year}</div>
	<SimpleCard padding={false} className={`flex w-fit`}>
		{Object.keys(coursePeriods[year]).map(month => <div key={month} className={`max-w-28 pt-4`}>
			<span className='mx-4 mt-4'>{getMonthNameByMonthNumber(month)}</span>
			<div className="mt-2">
				{coursePeriods[year][month].map(color => <div key={color} style={{backgroundColor: color}} className="h-2 w-full"></div>)}
			</div>
		</div>)}
	</SimpleCard>
</div>
);

const StudentsTable = ({ students, onSeePayments }) => {
	const studentsColumns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Documento',
            selector: row => row.document,
            sortable: true,
        },
        {
            name: 'Email',
            cell: row => (<>
			<div className="flex flex-col justify-center">
				<div className="relative py-3 sm:max-w-xl sm:mx-auto">
					<div className="group cursor-pointer relative inline-block">{row.email}
						<div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
						{row.email}
						<svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
						</div>
					</div>
				</div>
			</div>
			</>),
            sortable: true,
        },
        {
            name: 'Pagos',
            cell: row => (<StudentCoursesInfo onSeePayments={onSeePayments} student={row}/>),
            sortable: false,
        },
        {
            name: 'Numero de telefono',
            selector: row => row.phoneNumber,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.status === STUDENT_STATUS.ACTIVE ? "Activo" : "Suspendido",
            sortable: true,
        },
    ];

	return <Table
		columns={studentsColumns}
		data={students}
		noDataComponent="Este curso aun no posee alumnos"
		pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
	/>
}

const ProfessorsPeriods = ({ professorPeriods }) => {

	const getProfessorDetail = (period, i) => {
		const professor = period.professor
		return <li key={i} className='flex items-center mb-2'>
			<span className='mr-2 text-4xl' style={{color: period.color }}>•</span>
			<div>
				<div><Link to={`/home/professors/${professor.id}`} className='hover:underline text-black'>{`${professor.name} ${professor.lastName}`}</Link> <span className='font-medium ml-2'>{formatDateDDMMYY(period.startAt)} - {formatDateDDMMYY(period.endAt)}</span></div>
				<div className='text-gray-500'>{prettyCriteria(period.criteria, period.criteriaValue)}</div>
			</div>
		</li>
	}
	
	return <ul>{professorPeriods.map((period, index) => getProfessorDetail(period, index))}</ul>
}

const TasksModule = ({ course, onUpdateTask }) => {
	const addTaskModal = useModal()
	const copyTasksModal = useModal()
	return <>
	<h2 className='text-2xl font-bold mb-4'>Tareas</h2>
    <ButtonPrimary className={"mb-4"} onClick={addTaskModal.open}>Agregar tarea<AddTaskIcon className='ml-2'/></ButtonPrimary>
    <ButtonPrimary className={"mb-4 ml-2"} onClick={copyTasksModal.open}>Copiar tareas de un curso</ButtonPrimary>
	<TasksTable onUpdateTask={onUpdateTask} course={course}/>
	<TaskModal onUpdateTask={onUpdateTask} isModalOpen={addTaskModal.isOpen} setDisplay={addTaskModal.close} courseName={course.title} courseId={course.id} />
	<CopyTaskModal isModalOpen={copyTasksModal.isOpen} setDisplay={copyTasksModal.close} courseName={course.title} courseId={course.id} />
</>
}

const StudentsModule = ({ course, onSuspensionsChange }) => {
	const suspensionsModal = useModal()
	const [activeStudent, setActiveStudent] = useState(null);
	const onSeeStudentPayments = student => setActiveStudent(student)

	return <>
	<div>
		<div className='flex justify-between'>
			<h2 className='text-2xl font-bold mb-4'>Alumnos</h2>
			<ButtonPrimary className={"mb-6"} onClick={suspensionsModal.open}>Ver suspenciones</ButtonPrimary>
		</div>
		<StudentsTable onSeePayments={onSeeStudentPayments} students={course.students}/>
	</div>
	{activeStudent != null &&
		<Modal
			hiddingButton
			open={activeStudent != null}
			icon={<PaidIcon/>}
			size="large"
			setDisplay={() => setActiveStudent(null)}
			buttonText={"Aplicar"}
			title={`Pagos de ${activeStudent.name} ${activeStudent.lastName} sobre el curso`}
		>
			<StudentCalendar periods={activeStudent.pendingPayments} registration={activeStudent.registrationPayment}/>
		</Modal>

	}
	<SuspensionsModal
		students={course.students}
		isOpen={suspensionsModal.isOpen}
		onClose={suspensionsModal.close}
		courseId={course.id}
		onSuspensionsChange={onSuspensionsChange}
	/>
</>
}

const ProfessorsModule = ({ course, coursePeriods }) => {
	const courseDetailModal = useModal()
	return <>
	<div className='divide-y'>
		<div className='flex'>
			<div className='w-6/12'>
				<h2 className='mb-2 text-2xl font-bold'>Profesores</h2>
				<ProfessorsPeriods professorPeriods={course.periods}/>
			</div>
			<div className='w-6/12'>
				<CourseCollected course={course}/>
			</div>
		</div>
		<div className='my-6'></div>
	</div>
	<div className={`divide-y ${course?.isCircular && 'hidden'}`}>
		<div>
			<CourseDetailModal isOpen={courseDetailModal.isOpen} onClose={courseDetailModal.close} course={course}/>
			<div className='flex items-center'>
				<h2 className='text-2xl font-bold mb-2'>Periodos</h2>
				<div onClick={courseDetailModal.open} className='ml-4 font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer'>Abrir calendario</div>
			</div>
			<ProfessorCalendar coursePeriods={coursePeriods}/>
		</div>
		<div className='my-6'></div>
	</div>
	</>
}

const CourseCollected = ({ course }) => <>
<div className='flex flex-end'>
	<div className='mr-1'>
		<SliderMonthCard operativeResult payments={course.payments} all title={"Total recaudado"}/>
	</div>
	<div className='ml-1'>
		<SliderMonthCard operativeResult payments={course.payments} title={"Recaudado"}/>
	</div>
</div>
</>
const CourseDetail = () => {
	let { courseId } = useParams();
	const [course, setCourse] = useState(null)
	const [coursePeriods, setCoursePeriods] = useState([]);
	const { getCourseDetailsById } = useContext(Context);

	useEffect(() => {
		const getRandomColor = colorsTaken => {
			const predefinedColors = ["#B1DDF1", "#9F87AF", "#EE6C4D", "#5EF38C", "#08415C"]
			for (const color of predefinedColors) {
				if (!colorsTaken.includes(color))
					return color;
			}
			return randomColor()
		}
		const getData = async () => {
			const course = await getCourseDetailsById(courseId)
			const professorsColors = {}
			for (const period of course.periods) {
				const professorId = period.professorId
				if (professorId in professorsColors) {
					period.color = professorsColors[professorId]
					continue
				}
				const color = getRandomColor(Object.values(professorsColors));
				professorsColors[professorId] = color
				period.color = color

			};
			setCourse(course)
		}
		getData()
	}, [courseId, getCourseDetailsById]);

	const refreshCourse = async () => {
		const course = await getCourseDetailsById(courseId)
		setCourse(course)
	}

	const onUpdateTask = refreshCourse

	const [tabValue, setTabValue] = useState("1");

	const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

	useEffect(() => {
		if (course == null || course.isCircular) return
		const result = series(course.startAt, course.endAt)
		const periods = {}
		result.forEach(period => {
			const year = period.getFullYear()
			const month = period.getMonth()+1
			if (!(year in periods))
				periods[year] = {}
			periods[year][month] = []
			const periodDate = new Date(year, month-1,1)
			course.periods.forEach(period => {
				const [startYear, startMonth, startDay] = period.startAt.split("-")
				const [endYear, endMonth, endDay] = period.endAt.split("-")
				const startAt = new Date(startYear, parseInt(startMonth)-1, startDay)
				const endAt = new Date(endYear, parseInt(endMonth)-1, endDay)
				if (periodDate >= startAt && periodDate <= endAt) {
					periods[year][month].push(period.color)
				}
			})
		})
		setCoursePeriods(periods)
	}, [course])

	
  return (
    <Container disableTitle className="max-w-full" items={[{ name: "Cursos", href: "/home/courses" }, { name: `${course?.title}`, isLoading: course === null }]}>
		{course !== null ?
		<>
			<h1 className='text-2xl md:text-3xl text-center mb-12'>{course?.title}</h1>
			<p className='text-center'>{course.description}</p>

			<Box sx={{ width: '100%', typography: 'body1' }}>
				<TabContext value={tabValue}>
					<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
						<TabList onChange={handleChangeTabValue}>
							<Tab label="Profesores" value="1" />
							<Tab label="Alumnos" value="2" />
							<Tab label="Tareas" value="3" />
						</TabList>
					</Box>
					<TabPanel className="pt-4" value="1">
						<ProfessorsModule
							course={course}
							coursePeriods={coursePeriods}
						/>
					</TabPanel>
					<TabPanel className="pt-4" value="2">
						<StudentsModule course={course} onSuspensionsChange={refreshCourse}/>
					</TabPanel>
					<TabPanel className="pt-4" value="3">
						<TasksModule course={course} onUpdateTask={onUpdateTask}/>
					</TabPanel>
				</TabContext>
			</Box>
		</>
		
		: <CourseDetailSkeleton />
		}
    </Container>
  )
}

export default CourseDetail;