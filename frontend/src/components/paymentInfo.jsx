import React, { useContext } from "react";
import { formatDateDDMMYY, formatPaymentValue } from "../utils";
import Link from "./link/link";
import BlueBudget from "./badget/blue";
import { Context } from "../context/Context";

export default function PaymentInfo({ payment }) {

    const { getSecretaryPaymentById } = useContext(Context)
    const secretaryPayment = getSecretaryPaymentById(payment.secretaryPaymentId)

    const getUserFullName = (payment) => {
        if (payment.user && payment.user !== undefined && payment.user !== null) {
            return `${payment.user.firstName} ${payment.user.lastName}`
        } else {
            return "Sistema";
        }
    }

    const hasDiscount = payment => payment.discount != null

    const getOriginalPaymentValue = payment => payment.value / ((100 - payment.discount) / 100)

    return (
    <div className="w-full border rounded p-4 shadow-md bg-white mb-4">
        <div>
            <div className="w-full flex justify-between">
                {hasDiscount(payment) ?
                <div className="flex">
                    <div className="font-bold text-lg text-gray-400 line-through">{formatPaymentValue(getOriginalPaymentValue(payment))}</div>
                    <div className="font-bold text-lg ml-2">{formatPaymentValue(payment.value)}</div>
                    <div className="font-bold text-lg ml-2 flex items-center"><BlueBudget className="px-1">{payment.discount}%</BlueBudget></div>
                </div>
                :
                <div className="font-bold text-lg">{formatPaymentValue(payment.value)}</div>
                }
                <Link to={`/home?tab=${payment.verified ? "1" : "2"}&id=${payment.id}`} className="text-gray-400 text-xs cursor-pointer">#{payment.id}</Link>
            </div>
            <div>Fecha del pago: {formatDateDDMMYY(new Date(payment.at))}</div>
            {("secretaryPaymentId" in payment && payment.secretaryPaymentId != null) && <>
                <div>Pago de secretaria:</div>
                <ul>
                    <li>Salario: <span>{formatPaymentValue(secretaryPayment.salary)}</span></li>
                    <li>Monotributo: <span>{formatPaymentValue(secretaryPayment.monotributo)}</span></li>
                    <li>S.A.C.: <span>{formatPaymentValue(secretaryPayment.sac)}</span></li>
                    <li>Horas extras: <span>{formatPaymentValue(secretaryPayment.extraHours)}</span></li>
                    <li>Tareas extras: <span>{formatPaymentValue(secretaryPayment.extraTasks)}</span></li>
                </ul>
            </>}
            <div>Estudiante: {payment?.student?.name} {payment?.student?.lastName}</div>
            <div>Tipo de pago: {payment.type}</div>
            <div>Curso: {payment?.course?.title}</div>
            <div>Pago informado por: {getUserFullName(payment)}</div>
        </div>
    </div>
    );
} 