import React, { useContext, useState } from 'react'
import Modal from '../modal'
import DeleteIcon from '@mui/icons-material/Delete';
import { Context } from '../../context/Context';

const DeletePaymentModal = ({ payment, isOpen, onClose, }) => {
	const { deletePayment } = useContext(Context);

	const [isDeletingPayment, setIsDeletingPayment] = useState(false)

	const handleDeletePayment = async () => {
		setIsDeletingPayment(true);
		await deletePayment(payment.id);
		setIsDeletingPayment(false);
		onClose()
}

  return (
    <Modal danger onClose={onClose} icon={<DeleteIcon />} open={isOpen} setDisplay={onClose} title="Eliminar pago" buttonText={isDeletingPayment ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeletePayment}>
			{payment !== null &&
				<div>Esta a punto de eliminar el pago con el importe de <span className="font-bold">{payment.value}$</span>{payment.fileId !== null && ", este pago tiene asociado un comprobante el cual tambien sera eliminado."}</div>
			}
    </Modal>
  )
}

export default DeletePaymentModal