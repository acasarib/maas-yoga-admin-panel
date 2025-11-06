import React, { useContext, useEffect } from 'react'
import useToggle from '../../hooks/useToggle'
import Modal from '../modal'
import DoneIcon from '@mui/icons-material/Done';
import { useState } from 'react';
import { Context } from '../../context/Context';
import { PAYMENT_OPTIONS } from '../../constants';
import CommonInput from '../commonInput';
import CustomRadio from '../radio/customRadio';
import UsageBar from 'react-usage-bar'
import "react-usage-bar/dist/index.css"

import dayjs from 'dayjs';
import Select from '../select/select';
import DateTimeInput from '../calendar/dateTimeInput';
import Label from '../label/label';

const VerifyPaymentModal = ({ onClose, isOpen, payment }) => {
	const { verifyPayment, updatePayment, splitPayment } = useContext(Context);
	const [verifying, setVerifying] = useState(false)
	const [verifingPaymentMethod, setVerifingPaymentMethod] = useState(PAYMENT_OPTIONS[0])
	const [paymentValue, setPaymentValue] = useState("")
	const [partialPaymentValue, setPartialPaymentValue] = useState("")
	const isPartialPayment = useToggle()
	const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));

	const itemsToDisplay = [
		{
		  name: "Parcial",
		  value: partialPaymentValue == "" ? 0 : parseInt(partialPaymentValue),
		  color: "#BAF7D0",
		},
		{
		  name: "Total",
		  color: "#FECACA",
		  value: partialPaymentValue == "" ? parseInt(paymentValue) : parseInt(paymentValue) - parseInt(partialPaymentValue),
		}
	]

	useEffect(() => {
		if (payment) {
			let paymentOption = PAYMENT_OPTIONS.find(po => po.value === payment.type)
			if (!paymentOption) {
				paymentOption = PAYMENT_OPTIONS[0]
			}
			setVerifingPaymentMethod(paymentOption);
			setPaymentValue(payment.value)
			setOperativeResult(dayjs(new Date(payment.operativeResult)));
		}
	}, [payment])
	

	const handleVerifyPayment = async () => {
		if (!isPartialPayment.value) {
			setVerifying(true);
			const newPaymentValues = { operativeResult, value: paymentValue, type: verifingPaymentMethod.value }
			await updatePayment(newPaymentValues, payment.id);
			await verifyPayment(payment.id, newPaymentValues);
			setVerifying(false);
			onClose()
		} else {
			setVerifying(true);
			const paymentData = { verified: true, operativeResult, value: partialPaymentValue, type: verifingPaymentMethod.value }
			await splitPayment(paymentData, payment.id)
			setVerifying(false)
			onClose()
		}
	}
  return (
    <Modal size="small" onClose={onClose} icon={<DoneIcon />} open={isOpen} setDisplay={onClose} title="Verificar pago" buttonText={verifying ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Verificando...</span></>) : <span>Verificar</span>} onClick={handleVerifyPayment}>
			{payment !== null && <>
				<div className='grid grid-cols-2 gap-6'>
					<div className="col-span-2">
						<Label htmlFor="paymentType">Tipo de pago</Label>	
						<CustomRadio 
							name="paymentType"
							label="Total"
							checked={!isPartialPayment.value}
							onChange={isPartialPayment.toggle}
						/>
						<CustomRadio 
							name="paymentType"
							label="Parcial"
							checked={isPartialPayment.value}
							onChange={isPartialPayment.toggle}
						/>
					</div>
					<div className={`${isPartialPayment.value ? "col-span-2" : "hidden"} md:col-span-1`}>
						<CommonInput 
							currency
							label="Importe parcial"
							name="title"
							className="block font-bold text-sm text-gray-700 mb-2"
							type="number" 
							placeholder="Importe" 
							value={partialPaymentValue}
							onChange={(e) => setPartialPaymentValue(e.target.value)}
						/>
					</div>
					<div className={`md:col-span-1 col-span-2`}>
						<CommonInput 
							currency
							label={isPartialPayment.value ? "Total sin verificar" : "Importe"}
							id="val"
							name="val"
							type="number" 
							placeholder="Importe" 
							value={paymentValue}
							onChange={(e) => setPaymentValue(e.target.value)}
						/>
					</div>
					{/*!isPartialPayment.value &&
						<div className="col-span-1"></div>
					*/}
					<div className="col-span-2">
						<Label htmlFor="paymentT">Modo de pago</Label>
						<Select className="z-100" name="paymentT" value={verifingPaymentMethod} onChange={setVerifingPaymentMethod} options={PAYMENT_OPTIONS} />
					</div>
					<div className="col-span-2">
						<DateTimeInput
							className="w-full"
							name="operativeResult"
							label="Resultado operativo"
							value={operativeResult}
							onChange={(newValue) => setOperativeResult(newValue)}
						/>
					</div>
				</div>
				<div className={`${!isPartialPayment.value && 'invisible'} mt-10`}>
					<UsageBar errorMessage="" items={itemsToDisplay} showPercentage darkMode={false} total={parseInt(paymentValue)} />
				</div>
				</>
			}
    </Modal>
  )
}

export default VerifyPaymentModal