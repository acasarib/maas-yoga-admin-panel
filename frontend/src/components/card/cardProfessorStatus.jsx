import React, { useEffect, useState } from 'react'
import SimpleCard from './simpleCard'
import { capitalizeFirstCharacter, formatPaymentValue, getMonthNameByMonthNumber, series } from '../../utils'
import WarningAlert from '../alert/warning'
import DangerAlert from '../alert/danger'
import SuccessAlert from '../alert/success'
import ProfessorPaymentNotVerifiedList from '../list/professorPaymentNotVerifiedList'
import ProfessorPaymentPendingList from '../list/professorPaymentPendingList'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

function SliderMonthCard({ payments, title }) {
	const [currentIndex, setCurrentIndex] = useState(null)
	const [indexPayments, setIndexPayments] = useState([])
	const removeDays = date => date.slice(0, -3);
	
	useEffect(() => {
		const indexPayments = []
		payments.forEach(p => {
			const date = removeDays(p.periodFrom)
			const indexPayment = indexPayments.find(indexPayment => indexPayment.date === date)
			if (!indexPayment) {
				indexPayments.push({ date, value: p.value })
			} else {
				indexPayment.value += p.value
			}
		})
		indexPayments.sort((a,b) => {
			var dateA = new Date(a.date + "-01");
			var dateB = new Date(b.date + "-01");
			if (dateA < dateB) {
				return -1;
			}
			if (dateA > dateB) {
				return 1;
			}
			return 0;
		});
		setIndexPayments(indexPayments)
		setCurrentIndex(indexPayments.length > 0 ? indexPayments.length -1 : null)
	}, [payments])
	
	const onClickPreviousArrow = () => setCurrentIndex(currentIndex-1)

	const onClickNextArrow = () => setCurrentIndex(currentIndex+1)

	const formatDate = (date) => {
		const split = date.split("-")
		const month = capitalizeFirstCharacter( getMonthNameByMonthNumber(split[1]) )
		const year = split[0]
		return month + " " + year
	}

	return <SimpleCard>
		{currentIndex !== null ? 
		<div>
			<h3 className='text-lg leading-6 font-medium text-gray-900'>{formatPaymentValue(indexPayments[currentIndex].value)}</h3>
			<p className="text-sm font-medium text-gray-500">{title}</p>
			<div className="text-sm font-medium text-gray-500 flex">
				<div className={`cursor-pointer ${currentIndex === 0 ? "invisible" : ""}`}>
					<ArrowLeftIcon onClick={onClickPreviousArrow}/>
				</div>
				{formatDate(indexPayments[currentIndex].date)}
				<div className={`cursor-pointer ${currentIndex === indexPayments.length-1 ? "invisible" : ""}`}>
					<ArrowRightIcon className="cursor-pointer" onClick={onClickNextArrow}/>
				</div>
			</div>
		</div>
		: 
		<div>
			<h3 className='text-lg leading-6 font-medium text-gray-900'>$0</h3>
			<p className="text-sm font-medium text-gray-500">{title}</p>
		</div>}
	

	</SimpleCard>
}


const CardProfessorStatus = ({ professor, onClickVerifyPayment, onClickDeletePayment }) => {
	const verifiedPayments = professor.payments.filter(p => p.verified)
	const notVerifiedPayments = professor.payments.filter(p => !p.verified)
	const owedPeriods = []
	const notVerifiedPeriods = []

	const getPaymentAt = (month, year, courseId) => {
		return professor.payments.find(payment => {
			if (!("periodFrom" in payment && "periodTo" in payment)) {
				return false;
			}
			if (courseId != payment.courseId) {
				return false
			}
			const paymentFrom = new Date(payment.periodFrom + "T00:00:00")
			const paymentTo = new Date(payment.periodTo + "T23:59:59")
			const paymentFromMonth = paymentFrom.getMonth()+1
			const paymentToMonth = paymentFrom.getMonth()+1
			const paymentToYear = paymentTo.getFullYear()
			const paymentFromYear = paymentTo.getFullYear()
			const sameMonth = month == paymentFromMonth && month == paymentToMonth
			const sameYear = year == paymentFromYear && year == paymentToYear
			return sameMonth && sameYear
		})
	}

	professor?.courses?.forEach(course => {
		course.professorCourse.forEach(period => {
			const seriesPeriod = series(period.startAt, period.endAt)
			seriesPeriod.forEach(dateMonth => {
				const year = dateMonth.getFullYear();
				const month = dateMonth.getMonth() +1;
				const payment = getPaymentAt(month, year, course.id)
				if (payment) {
					if (!payment.verified) {
						notVerifiedPeriods.push({year,month, payment, course})
					}
				} else {
					const date = new Date()
					const currentYear = date.getFullYear()
					const currentMonth = date.getMonth()+1
					if (year < currentYear) {
						owedPeriods.push({year,month, course})
					} else if (year === currentYear) {
						if (month < currentMonth) {
							owedPeriods.push({year,month, course})
						}
					}
				}
			})
		})
	})


	
  return (
    <SimpleCard>
		<div className='lg:flex mb-4'>
			<div className='mb-2 lg:mb-0 lg:mr-1 w-full'>
				<SliderMonthCard payments={verifiedPayments} title="Pagos verificados"/>
			</div>
			<div className='lg:ml-1 w-full'>
				<SliderMonthCard payments={notVerifiedPayments} title="Pagos no verificados"/>
			</div>
		</div>
		{owedPeriods.length == 0 && notVerifiedPeriods == 0 &&
		<div className='mb-4'>
			<SuccessAlert title="Al dia">No hay pagos pendientes.</SuccessAlert>
		</div>}
		{owedPeriods.length > 0 && 
		<div className='mb-4'>
			<DangerAlert title="Pago pendiente">Se debe generar un pago para los siguientes periodos.</DangerAlert>
			<ProfessorPaymentPendingList periods={owedPeriods}/>
		</div>}
		{notVerifiedPeriods.length > 0 && 
		<div className='mb-4'>
			<WarningAlert title="Verificacion de pagos">Los siguientes pagos han sido generados pero no se han verificado aun.</WarningAlert>
			<ProfessorPaymentNotVerifiedList
				onClickDeletePayment={onClickDeletePayment}
				onClickVerifyPayment={onClickVerifyPayment}
				periods={notVerifiedPeriods}
			/>
		</div>}
    </SimpleCard>
  )
}

export default CardProfessorStatus