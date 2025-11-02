import React, { useContext } from "react";
import { useEffect } from "react";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import { addLeadingZeroLessTen, formatPaymentValue, getLastDayOfMonth } from "../../utils";
import Link from "../link/link";
import PlusButton from "../button/plus";

export default function ProfessorCalendar({ onClickAddProfessorPayment, professor, courseId, enabledPeriods, payments }) {
    
    const [currentYear, setCurrentYear] = useState(null);
    const [periods, setPeriods] = useState({});
    const years = Object.keys(periods);
    const arrowLeftDisabled = years.filter(year => parseInt(year) < parseInt(currentYear)).length === 0;
    const arrowRightDisabled = years.filter(year => parseInt(year) > parseInt(currentYear)).length === 0;
    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const getMonthName = (month) => {
        return monthNames[parseInt(month)-1];
    }

    const getMonthDetail = month => {
        try {
            if (periods[currentYear][month]) {
                const monthDetails = periods[currentYear][month];
                if (!monthDetails.paid) {
                    if (monthDetails.dictedByProfessor) {
                        return <NoPayments onClickAddProfessorPayment={onClickAddProfessorPayment} year={currentYear} month={month} professor={professor} courseId={courseId}/>;
                    } else {
                        return "No disponible";
                    }
                }
                const itemList = monthDetails.payments.map((payment, index) => {
                    let item;
                    if (!payment.verified) {
                        item = (<><Link to={`/home/payments?id=${payment.id}&tab=2`}>Pago</Link> sin verificar {formatPaymentValue(payment.value)}</>);
                    } else {
                        const title = `${formatPaymentValue(payment.value *-1)} por ${payment.type}`;
                        const monthStatus = "realizado " + formatPaymentValue(payment.value *-1);
                        item = (<Tooltip title={title}><span><Link to={`/home/payments?id=${payment.id}`}>Pago</Link> {monthStatus}</span></Tooltip>)
                    }
                    return <div key={index}>{item}</div>
                })

                const handleOnCreatePayment = async () => {
                    const m = addLeadingZeroLessTen(month);
                    const from = `${currentYear}-${m}-01`;
                    const to = `${currentYear}-${m}-${getLastDayOfMonth(currentYear, month)}`;
                    onClickAddProfessorPayment({ from, to, professorId: monthDetails.payments[0].professorId, courseId: monthDetails.payments[0].courseId })
                }

                return (
                    <div className="flex">
                        <div>{itemList}</div>
                        <Tooltip title={"Agregar"}>
                            <div className="w-5 h-5 ml-4">
                                <PlusButton size="xs" onClick={handleOnCreatePayment}/>
                            </div>
                        </Tooltip>
                    </div>)
            } else {
                return "no hay datos";
            }
        } catch(e) {
            console.log(e);
            return "";
        }
    }

    useEffect(() => {
        const periods = {};
        const toCustomDateObj = str => {
            try {
                const yyyymmdd = str.split("T")[0];
                const [year, month, day] = yyyymmdd.split("-");
                return { year: parseInt(year), month: parseInt(month), day: parseInt(day) };
            } catch(e) {
                const [year, month, day] = str.split("-");
                return { year, month, day };
            }
        }
        for (const period of enabledPeriods) {
            let start = toCustomDateObj(period.startAt);
            let end = toCustomDateObj(period.endAt);
            while ((start.year < end.year) || (start.year  === end.year && start.month <= end.month)) {
                const year = start.year;
                if (!(year in periods)) {
                    periods[year] = {};
                    for (let i = 1; i <= 12; i++) {
                        periods[year][i] = {
                            dictedByProfessor: false,
                            payments: [],
                            paid: false,
                        }
                    }
                }
                periods[year][start.month].dictedByProfessor = true;
                start.month = start.month+1;
                if (start.month >= 13) {
                    start.month = 1;
                    start.year++;
                }
            }
        }
        for (const payment of payments) {
            if (payment.courseId != courseId) {
                continue
            }
            if (payment.periodFrom == null || payment.periodTo == null) {
                continue
            }
            
            let start = toCustomDateObj(payment.periodFrom);
            let end = toCustomDateObj(payment.periodTo);
            while ((start.year < end.year) || (start.year  === end.year && start.month <= end.month)) {
                const year = start.year;
                if (!(year in periods)) {
                    periods[year] = {};
                    for (let i = 1; i <= 12; i++) {
                        periods[year][i] = {
                            dictedByProfessor: false,
                            payments: [],
                            paid: false,
                        }
                    }
                }
                periods[year][start.month].paid = true;
                periods[year][start.month].payments.push(payment)
                start.month = start.month+1;
                if (start.month >= 13) {
                    start.month = 1;
                    start.year++;
                }
            }
        }
        setCurrentYear(Object.keys(periods)[0]);
        setPeriods(periods);
    }, [enabledPeriods, payments]);

    return (<>
        <div className="flex justify-between bg-gray-100 px-4 py-1">
            <ArrowLeftIcon className={arrowLeftDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => !arrowLeftDisabled && setCurrentYear(parseInt(currentYear)-1)}/>
            <div>{currentYear}</div>
            <ArrowRightIcon className={arrowRightDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => !arrowRightDisabled && setCurrentYear(parseInt(currentYear)+1)}/>
        </div>
        <div>
            {Object.keys(periods).length > 0 &&
                Object.keys(periods[currentYear]).map((month, i) =>
                    <div key={i} className={`${i % 2 == 1 && "bg-gray-100"} px-4 py-1`}>
                        <span className={`${!periods[currentYear][month].dictedByProfessor && "text-gray-400"} flex justify-between`}>
                            <span>{getMonthName(month)}</span>
                            <span>{getMonthDetail(month)}
                            </span>
                        </span>
                    </div>
                )
            }
        </div>
    </>);
} 

function NoPayments({ month, year, courseId, professor, onClickAddProfessorPayment }) {

    const handleOnCreatePayment = async () => {
        const m = addLeadingZeroLessTen(month);
        const from = `${year}-${m}-01`;
        const to = `${year}-${m}-${getLastDayOfMonth(year, month)}`;
        onClickAddProfessorPayment({ from, to, professorId: professor.id, courseId })
    }

    return <>No hay pagos <span onClick={handleOnCreatePayment} className="underline cursor-pointer">agregar</span></>
}