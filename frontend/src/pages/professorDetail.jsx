import React, { useContext, useEffect, useState } from 'react'
import Container from '../components/container'
import { useParams } from 'react-router-dom';
import ViewSlider from 'react-view-slider'
import { Context } from '../context/Context';
import CardItem from '../components/card/cardItem';
import SchoolIcon from '@mui/icons-material/School';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import PaidIcon from '@mui/icons-material/Paid';
import ProfessorCourses from '../components/section/professor/professorCourses';
import ProfessorPayments from '../components/section/professor/ProfessorPayments';
import ProfessorCard from '../components/card/professorCard';
import SimpleCard from '../components/card/simpleCard';
import CardProfessorStatus from '../components/card/cardProfessorStatus';
import VerifyPaymentModal from '../components/modal/verifyPaymentModal';
import useModal from '../hooks/useModal';
import DeletePaymentModal from '../components/modal/deletePaymentModal';

const ProfessorDetail = () => {
	let { professorId } = useParams();
	const [professor, setProfessor] = useState(null)
	const [activeView, setActiveView] = useState(0);
	const [activeSection, setActiveSection] = useState("");
	const [payment, setPayment] = useState(null);
	const verifyPaymentModal = useModal()
	const deletePaymentModal = useModal()
	const { isLoadingProfessors, getProfessorDetailsById } = useContext(Context);
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

	const Menu = () => (<>
		<div className='sm:flex'>
			<div className='w-full sm:w-6/12 mb-4 sm:mb-0 sm:mr-2'>
				<ProfessorCard professor={professor}/>
			</div>
			<div className="w-full sm:w-6/12 sm:ml-2 flex flex-col">
				<CardItem className="mb-4" icon={<LocalLibraryIcon/>} onClick={() => setActiveSection("courses")}>Cursos</CardItem>
				<CardItem className="mb-4 sm:mb-8" icon={<PaidIcon/>} onClick={() => setActiveSection("payments")}>Pagos</CardItem>
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
			{activeSection === "courses" && <ProfessorCourses onAddPayment={onAddPayment} professor={professor} onCancel={onCancelImport}/>}
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
		</>
		}
    </Container>
  )
}

export default ProfessorDetail