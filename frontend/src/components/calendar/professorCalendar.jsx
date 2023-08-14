import React from "react";
import { useEffect } from "react";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react";
import Tooltip from '@mui/material/Tooltip';

export default function ProfessorCalendar({ enabledPeriods, payments }) {
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

    const getMonthStatus = (month) => {
        try {
            const isMonthPaid = periods[currentYear][month].paid;
            const isMonthPaidVerified = periods[currentYear][month].verified;
            if (isMonthPaid) {
                if (isMonthPaidVerified) {
                    return "pago realizado";
                } else {
                    return "pago sin verificar";
                }
            } else {
                return "no hay pagos";
            }
        } catch(e) {
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
                            verified: false,
                            paid: false,
                        }
                    }
                }
                periods[year][start.month].dictedByProfessor = true;
                start.month = start.month+1;
            }
        }
        for (const payment of payments) {
            let start = toCustomDateObj(payment.periodFrom);
            let end = toCustomDateObj(payment.periodTo);
            while ((start.year < end.year) || (start.year  === end.year && start.month <= end.month)) {
                const year = start.year;
                if (!(year in periods)) {
                    periods[year] = {};
                    for (let i = 1; i <= 12; i++) {
                        periods[year][i] = {
                            dictedByProfessor: false,
                            verified: false,
                            paid: false,
                        }
                    }
                }
                periods[year][start.month].paid = true;
                periods[year][start.month].verified = payment.verified;
                periods[year][start.month].payment = payment;
                start.month = start.month+1;
            }
        }
        setCurrentYear(Object.keys(periods)[0]);
        setPeriods(periods);
    }, [enabledPeriods])

    return (<>
        <div className="flex justify-between bg-gray-100 px-4 py-1">
            <ArrowLeftIcon className={arrowLeftDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => setCurrentYear(parseInt(currentYear)-1)}/>
            <div>{currentYear}</div>
            <ArrowRightIcon className={arrowRightDisabled ? "text-gray-400" : "cursor-pointer"} onClick={() => setCurrentYear(parseInt(currentYear)+1)}/>
        </div>
        <div>
            {Object.keys(periods).length > 0 &&
                Object.keys(periods[currentYear]).map((month, i) =>
                    <div key={i} className={`${i % 2 == 1 && "bg-gray-100"} px-4 py-1`}>
                        <span className={`${!periods[currentYear][month].dictedByProfessor && "text-gray-400"} flex justify-between`}>
                            <span>{getMonthName(month)}</span>
                            <span>{"payment" in periods[currentYear][month] ? 
                                <Tooltip title={"payment" in periods[currentYear][month] ? `$${periods[currentYear][month].payment.value *-1} por ${periods[currentYear][month].payment.type}` : ""}>{<span>{getMonthStatus(month)}</span>}</Tooltip>
                                : getMonthStatus(month)}
                            </span>
                        </span>
                    </div>
                )
            }
        </div>
    </>);
} 