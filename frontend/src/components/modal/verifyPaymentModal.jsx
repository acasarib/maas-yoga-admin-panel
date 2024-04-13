import React, { useContext, useEffect } from 'react'
import Modal from '../modal'
import DoneIcon from '@mui/icons-material/Done';
import { useState } from 'react';
import { Context } from '../../context/Context';
import { PAYMENT_OPTIONS } from '../../constants';
import Select from 'react-select';

const VerifyPaymentModal = ({ onClose, isOpen, payment }) => {
	const { verifyPayment, updatePayment } = useContext(Context);
	const [verifying, setVerifying] = useState(false)
	const [verifingPaymentMethod, setVerifingPaymentMethod] = useState(PAYMENT_OPTIONS[0])

	useEffect(() => {
		if (payment) {
			let paymentOption = PAYMENT_OPTIONS.find(po => po.value === payment.type)
			if (!paymentOption) {
				paymentOption = PAYMENT_OPTIONS[0]
			}
			setVerifingPaymentMethod(paymentOption);
		}
	}, [payment])
	

	const handleVerifyPayment = async () => {
		setVerifying(true);
		await updatePayment({ type: verifingPaymentMethod.value }, payment.id);
		await verifyPayment(payment.id);
		setVerifying(false);
		onClose()
	}
  return (
    <Modal onClose={onClose} icon={<DoneIcon />} open={isOpen} setDisplay={onClose} title="Verificar pago" buttonText={verifying ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Verificando...</span></>) : <span>Verificar</span>} onClick={handleVerifyPayment}>
			{payment !== null &&
				<div>
					<div>Esta a punto de verificar el pago con el importe de <span className="font-bold">{payment?.value}$</span></div>
					<div>
						<label className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</label>
						<Select value={verifingPaymentMethod} onChange={setVerifingPaymentMethod} options={PAYMENT_OPTIONS} />
					</div>
				</div>
			}
    </Modal>
  )
}

export default VerifyPaymentModal