import React, { useContext } from "react";
import { useEffect } from "react";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react";
import GreenBudget from "../badget/green";
import PendingBudget from "../badget/pendingBudget";
import RedBudget from "../badget/red";
import { formatDateDDMMYY, getMonthNames } from "../../utils";
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BlueBudget from "../badget/blue";
import Tooltip from '@mui/material/Tooltip';
import { STUDENT_MONTHS_CONDITIONS } from "../../constants";
import YellowBudget from "../badget/yellow";
import PaymentModal from "../modal/paymentModal";

export default function StudentCalendar({ periods, registration, allowAddPayment, studentData, onGeneratePayment }) {
    const [currentYear, setCurrentYear] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedPaymentData, setSelectedPaymentData] = useState(null);
    const years = Object.keys(periods);
    const arrowLeftDisabled = years.filter(year => parseInt(year) < parseInt(currentYear)).length === 0;
    const arrowRightDisabled = years.filter(year => parseInt(year) > parseInt(currentYear)).length === 0;
    const monthNames = getMonthNames();

    const getMonthName = (month) => {
        return monthNames[parseInt(month)-1];
    }

    const handlePaymentClick = (month) => {
        if (!allowAddPayment) return;
        
        setSelectedPaymentData({
            monthName: getMonthName(month),
            month: month,
            year: currentYear,
            amount: periods[currentYear][month].amount || null
        });
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedPaymentData(null);
    };

    const getMonthDetail = month => {
        const status = periods[currentYear][month].condition;
        if (status == STUDENT_MONTHS_CONDITIONS.PAID) {
            return (<Tooltip title={(<><div>Fecha que se realizo el pago: {formatDateDDMMYY(periods[currentYear][month].payment.at)}</div><div>Importe ${periods[currentYear][month].payment.value}</div></>)}><span><GreenBudget><CheckIcon className="mr-1" fontSize="small"/>Pagado</GreenBudget></span></Tooltip>);
        } else if (status == STUDENT_MONTHS_CONDITIONS.PENDING) {
            return (
                <span 
                    className={allowAddPayment ? "cursor-pointer" : ""} 
                    onClick={() => handlePaymentClick(month)}
                >
                    <PendingBudget>Pendiente</PendingBudget>
                </span>
            );
        } else if (status == STUDENT_MONTHS_CONDITIONS.NOT_PAID) {
            return (
                <span 
                    className={allowAddPayment ? "cursor-pointer" : ""} 
                    onClick={() => handlePaymentClick(month)}
                >
                    <RedBudget><CloseIcon className="mr-1" fontSize="small"/>No pagado</RedBudget>
                </span>
            );
        } else if (status == STUDENT_MONTHS_CONDITIONS.NOT_TAKEN) {
            return (<BlueBudget>Inscripto</BlueBudget>);
        } else if (status == STUDENT_MONTHS_CONDITIONS.SUSPEND) {
            return (<YellowBudget>Suspendido</YellowBudget>);
        } else if (status == STUDENT_MONTHS_CONDITIONS.CIRCULAR_NOT_PAID) {
            return (<BlueBudget>Curso circular</BlueBudget>);
        }
    }

    useEffect(() => {
        if (periods && Object.keys(periods).length > 0) {
            setCurrentYear(Object.keys(periods)[0]);
        }
    }, [periods]);
    
    return (<>
        <div className="flex justify-between bg-gray-100 px-4 py-1">
            <ArrowLeftIcon className={arrowLeftDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => !arrowLeftDisabled && setCurrentYear(parseInt(currentYear)-1)}/>
            <div>{currentYear}</div>
            <ArrowRightIcon className={arrowRightDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => !arrowRightDisabled && setCurrentYear(parseInt(currentYear)+1)}/>
        </div>
        <div>
            {registration?.isRegistrationPayment && (<div className="flex flex-wrap items-center justify-center w-full sm:mt-2"><GreenBudget><CheckIcon color="success" fontSize="small"/><span className="ml-2 text-md">El alumno se encuentra matrículado. Fecha de pago: {formatDateDDMMYY(registration.at)}. Importe: ${registration.value}</span></GreenBudget></div>)}
            {currentYear !== null &&
                Object.keys(periods[currentYear]).map((month, i) =>
                    <div key={i} className={`${i % 2 == 1 && "bg-gray-100"} px-4 py-1`}>
                        <span className={`${periods[currentYear][month] === false && "text-gray-400"} flex justify-between`}>
                            <span>{getMonthName(month)}</span>
                            <span>{getMonthDetail(month)}
                            </span>
                        </span>
                    </div>
                )
            }
        </div>
        <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            studentData={studentData}
            monthData={selectedPaymentData}
            onGeneratePayment={onGeneratePayment}
        />
    </>);
}