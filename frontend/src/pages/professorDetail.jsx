import React, { useContext, useEffect, useState } from 'react'
import Container from '../components/container'
import { useParams } from 'react-router-dom';
import ViewSlider from 'react-view-slider'
import { Context } from '../context/Context';
import CardItem from '../components/card/cardItem';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaidIcon from '@mui/icons-material/Paid';
import ProfessorCourses from '../components/section/professor/professorCourses';
import ProfessorPayments from '../components/section/professor/ProfessorPayments';
import ProfessorCard from '../components/card/professorCard';
import CardProfessorStatus from '../components/card/cardProfessorStatus';
import VerifyPaymentModal from '../components/modal/verifyPaymentModal';
import useModal from '../hooks/useModal';
import DeletePaymentModal from '../components/modal/deletePaymentModal';
import AddProfessorPaymentModal from '../components/modal/addProfessorPaymentModal';
import { prettyCriteria, series, toMonthsNames } from '../utils';
import { CASH_PAYMENT_TYPE } from '../constants';

const ProfessorDetail = () => {
	let { professorId } = useParams();
	const [professor, setProfessor] = useState(null)
	const [activeView, setActiveView] = useState(0);
	const [activeSection, setActiveSection] = useState("");
	const [payment, setPayment] = useState(null);
	const [professorPaymentData, setProfessorPaymentData] = useState(null);
	const verifyPaymentModal = useModal()
	const deletePaymentModal = useModal()
	const addProfessorPaymentModal = useModal()
	const { isLoadingProfessors, getProfessorDetailsById, calcProfessorsPayments, informPayment } = useContext(Context);
	const onCancelImport = () => setActiveSection("");


	useEffect(() => {
		setActiveView((activeSection === "") ? 0 : 1);
	}, [activeSection]);

	useEffect(() => {
		if (!isLoadingProfessors) {
			const getData = async () => {
				setProfessor(await getProfessorDetailsById(professorId))
			}
			getData()
		}
	}, [isLoadingProfessors])

	const onClickVerifyPayment = (payment) => {
		setPayment(payment)
		verifyPaymentModal.open()
	}

	const handleOnCloseVerifyPaymentModal = () => {
		onAddPayment()
		verifyPaymentModal.close()
	}

	const onClickDeletePayment = async (payment) => {
		setPayment(payment)
		deletePaymentModal.open()
	}

	const handleOnCloseDeletePaymentModal = () => {
		onAddPayment()
		deletePaymentModal.close()
	}

	const onAddPayment = async () => {
		setProfessor(await getProfessorDetailsById(professorId, true))
	}

	useEffect(() => {
		if (professorPaymentData != null) {
			addProfessorPaymentModal.open()
		}
	}, [professorPaymentData])

	const onClickAddProfessorPayment = async ({ from, to, professorId, courseId }) => {
		const data = await calcProfessorsPayments(from, to, professorId, courseId);
		try {
			setProfessorPaymentData({...data[0].professors[0], students: data[0].students, from, to, courseId })
		} catch (e) {
			const targetPeriod = from.slice(0, -3);
			const course = professor.courses.find(c => c.id == courseId)
			const period = course.professorCourse.find(pc => {
				const pcSeries = series(pc.startAt, pc.endAt)
				const formatPcSerie = (pcSerie) => {
					let month = pcSerie.getMonth()+1
					month = month < 10 ? '0' + month : month
					return pcSerie.getFullYear() + "-" + month
				}
				return pcSeries.some(pcSerie => formatPcSerie(pcSerie) == targetPeriod)
			})
			setProfessorPaymentData({
				result: { period, ...professor, totalStudents: 0, payments: [], collectedByProfessor: 0, courseId },
				from,
				to,
				courseId,
				id: professorId,
			})
		}
		addProfessorPaymentModal.open()
	}

	const addProfessorPayment = async (value) => {
        const payment = {
            type: CASH_PAYMENT_TYPE,
            value: value || professorPaymentData.result.collectedByProfessor * -1,
            at: new Date(),
            operativeResult: new Date(professorPaymentData.from.slice(0, -2) + "15"),
            periodFrom: professorPaymentData.from,
            periodTo: professorPaymentData.to,
            verified: false,
            courseId: professorPaymentData.result.courseId,
            professorId: professorPaymentData.id
        }
        informPayment(payment);
		setProfessorPaymentData(null);
		onAddPayment();
    }

	const getProfessorCriteria = () => {
		let periodCriteria = professorPaymentData.result.period.criteria;
		let criteriaValue = professorPaymentData.result.period.criteriaValue;
		return prettyCriteria(periodCriteria, criteriaValue)
	}

	const getPeriod = () => {
		return toMonthsNames(professorPaymentData.result.period.startAt, professorPaymentData.result.period.endAt)
	}

	const Menu = () => (<>
		<div className='sm:flex'>
			<div className='w-full xl:w-4/12 sm:w-6/12 mb-4 sm:mb-0 sm:mr-2'>
				<ProfessorCard professor={professor}/>
			</div>
			<div className="w-full sm:w-8/12 sm:ml-2 flex flex-col">
				<div className='sm:flex mb-4 sm:mb-8'>
					<CardItem className="sm:w-6/12 sm:mr-2 mb-4 sm:mb-0" icon={<LocalLibraryIcon/>} onClick={() => setActiveSection("courses")}>Cursos</CardItem>
					<CardItem className="sm:w-6/12" icon={<PaidIcon/>} onClick={() => setActiveSection("payments")}>Pagos</CardItem>
				</div>
				<CardProfessorStatus onClickDeletePayment={onClickDeletePayment} onClickVerifyPayment={onClickVerifyPayment} professor={professor}/>
			</div>
		</div>
	</>);

	const renderView = ({ index, active, transitionState }) => (
		<>
		{index === 0 &&
			<Menu/>
		}
		{index === 1 && 
			(<>
			{activeSection === "courses" && <ProfessorCourses onClickAddProfessorPayment={onClickAddProfessorPayment} professor={professor} onCancel={onCancelImport}/>}
			{activeSection === "payments" && 
				<ProfessorPayments
					onClickDeletePayment={onClickDeletePayment}
					onClickVerifyPayment={onClickVerifyPayment}
					professor={professor}
					onCancel={onCancelImport}
				/>}
			</>)
		}</>
	)
	
	const handleOnCloseAddProfessorPaymentModal = () => {
		setProfessorPaymentData(null);
		addProfessorPaymentModal.close()
	}

  return (
    <Container disableTitle className="max-w-full" items={[{ name: "Profesores", href: "/home/professors" }, { name: `${professor?.name} ${professor?.lastName}` }]}>
		{professor !== null &&
		<>
			<h1 className='text-2xl md:text-3xl text-center mb-12'>{professor?.name} {professor?.lastName}</h1>
			<ViewSlider
				renderView={renderView}
				numViews={2}
				activeView={activeView}
				animateHeight
				style={{ overflow: 'auto', padding: '4px'}}
			/>
			<VerifyPaymentModal payment={payment} isOpen={verifyPaymentModal.isOpen} onClose={handleOnCloseVerifyPaymentModal}/>
			<DeletePaymentModal payment={payment} isOpen={deletePaymentModal.isOpen} onClose={handleOnCloseDeletePaymentModal}/>
			{professorPaymentData != null &&
				<AddProfessorPaymentModal
					criteriaType={professorPaymentData.result.period.criteria}
					totalStudents={professorPaymentData.result.totalStudents}
					students={professorPaymentData.students}
					criteria={getProfessorCriteria()}
					criteriaValue={professorPaymentData.result.period.criteriaValue}
					courseValue={professorPaymentData.result.period.courseValue}
					period={getPeriod()}
					selectedPeriod={professorPaymentData.from}
					courseId={professorPaymentData.courseId}
					total={professorPaymentData.result.collectedByProfessor}
					payments={professorPaymentData.result.payments}
					addPayment={addProfessorPayment}
					isOpen={addProfessorPaymentModal.isOpen}
					onClose={handleOnCloseAddProfessorPaymentModal}
					professorName={professorPaymentData.name}
					allowManualValue
				/>
			}
		</>
		}
    </Container>
  )
}

export default ProfessorDetail