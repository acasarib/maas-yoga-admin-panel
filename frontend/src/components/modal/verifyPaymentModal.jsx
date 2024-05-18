import React, { useContext, useEffect } from 'react'
import Modal from '../modal'
import DoneIcon from '@mui/icons-material/Done';
import { useState } from 'react';
import { Context } from '../../context/Context';
import { PAYMENT_OPTIONS } from '../../constants';
import Select from 'react-select';
import CommonInput from '../commonInput';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const VerifyPaymentModal = ({ onClose, isOpen, payment }) => {
	const { verifyPayment, updatePayment } = useContext(Context);
	const [verifying, setVerifying] = useState(false)
	const [verifingPaymentMethod, setVerifingPaymentMethod] = useState(PAYMENT_OPTIONS[0])
	const [paymentValue, setPaymentValue] = useState("")
	const [operativeResult, setOperativeResult] = useState(dayjs(new Date()));

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
		setVerifying(true);
		await updatePayment({ operativeResult, value: paymentValue, type: verifingPaymentMethod.value }, payment.id);
		await verifyPayment(payment.id);
		setVerifying(false);
		onClose()
	}
  return (
    <Modal onClose={onClose} icon={<DoneIcon />} open={isOpen} setDisplay={onClose} title="Verificar pago" buttonText={verifying ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Verificando...</span></>) : <span>Verificar</span>} onClick={handleVerifyPayment}>
			{payment !== null && 
				<div className='grid grid-cols-2 gap-10 pt-6 mb-4'>
					<div className="col-span-2 md:col-span-1 pb-1">
						<CommonInput 
							label="Importe"
							name="title"
							className="block font-bold text-sm text-gray-700 mb-2"
							type="number" 
							placeholder="Importe" 
							value={paymentValue}
							onChange={(e) => setPaymentValue(e.target.value)}
						/>
					</div>
					<div className="col-span-2 md:col-span-1 pb-1">
						<label className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</label>
						<Select value={verifingPaymentMethod} onChange={setVerifingPaymentMethod} options={PAYMENT_OPTIONS} />
					</div>
					<div className="col-span-1">
						<span className="block text-gray-700 text-sm font-bold mb-2">Resultado operativo</span>
						<div className="mt-4">
							<DateTimePicker
								label="Seleccionar fecha"
								value={operativeResult}
								onChange={(newValue) => setOperativeResult(newValue)}
							/>
						</div>
                	</div>
				</div>
			}
    </Modal>
  )
}

export default VerifyPaymentModal