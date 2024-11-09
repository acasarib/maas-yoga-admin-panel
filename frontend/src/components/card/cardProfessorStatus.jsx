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
		{professor.owedPeriods.length == 0 && professor.notVerifiedPeriods == 0 &&
		<div className='mb-4'>
			<SuccessAlert title="Al dia">No hay pagos pendientes.</SuccessAlert>
		</div>}
		{professor.owedPeriods.length > 0 && 
		<div className='mb-4'>
			<DangerAlert title="Pago pendiente">Se debe generar un pago para los siguientes periodos.</DangerAlert>
			<ProfessorPaymentPendingList periods={professor.owedPeriods}/>
		</div>}
		{professor.notVerifiedPeriods.length > 0 && 
		<div className='mb-4'>
			<WarningAlert title="Verificacion de pagos">Los siguientes pagos han sido generados pero no se han verificado aun.</WarningAlert>
			<ProfessorPaymentNotVerifiedList
				onClickDeletePayment={onClickDeletePayment}
				onClickVerifyPayment={onClickVerifyPayment}
				periods={professor.notVerifiedPeriods}
			/>
		</div>}
    </SimpleCard>
  )
}

export default CardProfessorStatus