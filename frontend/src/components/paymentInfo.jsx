import React from "react";
import { formatDateDDMMYY, formatPaymentValue } from "../utils";

export default function PaymentInfo({ payment }) {

    return (
    <div className="w-full border rounded p-4 shadow-md bg-white mb-4">
        <div>
            <div className="w-full flex justify-between">
                <span>Fecha del pago: {formatDateDDMMYY(new Date(payment.at))}</span>
                <span className="text-gray-400 text-xs">#{payment.id}</span>
            </div>
            <div>Estudiante: {payment?.student?.name} {payment?.student?.lastName}</div>
            <div>Monto: {formatPaymentValue(payment.value)}</div>
            <div>Tipo de pago: {payment.type}</div>
            <div>Curso: {payment?.course?.title}</div>
            <div>Pago informado por: {payment.user.firstName} {payment.user.lastName}</div>
        </div>
    </div>
    );
} 