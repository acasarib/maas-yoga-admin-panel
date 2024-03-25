import React from "react";
import WarningModal from "./type/warning";
import Link from "../link/link";

export default function PaymentAlreadyAddedWarningModal({ isOpen, onClose, onConfirmWarning, payment }) {

    
	return(
		<WarningModal hiddingButton={false} onClick={onConfirmWarning} buttonText={"Aceptar"} isOpen={isOpen} onClose={onClose} title={"Pago ya agregado"}>
			<p className="mb-4">Ya se encuentra un pago informado para este profesor en este periodo. ¿Desea informar otro pago mas a este periodo?</p>
			{payment &&
				<Link className="link" to={`/home?tab=${payment.verified ? "1" : "2"}&id=${payment.id}`}>Ver pago</Link>
			}
		</WarningModal>
	);
}