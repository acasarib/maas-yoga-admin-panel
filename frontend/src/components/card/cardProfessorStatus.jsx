import React, { useEffect, useState } from 'react'
import SimpleCard from './simpleCard'
import { capitalizeFirstCharacter, formatPaymentValue, getMonthNameByMonthNumber, series } from '../../utils'
import WarningAlert from '../alert/warning'
import DangerAlert from '../alert/danger'
import SuccessAlert from '../alert/success'
import ProfessorPaymentNotVerifiedList from '../list/professorPaymentNotVerifiedList'
import ProfessorPaymentPendingList from '../list/professorPaymentPendingList'

import SliderMonthCard from './sliderMonthCard'

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
		<div className='xl:flex mb-4'>
			<div className='mb-2 xl:mb-0 xl:mr-2 xl:w-4/12'>
				<SliderMonthCard payments={verifiedPayments} title="Pagos verificados"/>
			</div>
			<div className='mb-2 xl:mb-0 xl:mr-2 xl:w-4/12'>
				<SliderMonthCard payments={notVerifiedPayments} title="Pagos no verificados"/>
			</div>
			<div className='xl:w-4/12'>
				<SliderMonthCard payments={verifiedPayments} all title="Total recaudado"/>
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