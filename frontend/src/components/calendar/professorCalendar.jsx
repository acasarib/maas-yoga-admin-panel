import React, { useContext } from "react";
import { useEffect } from "react";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react";
import Tooltip from '@mui/material/Tooltip';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import CurrencyInput from "../input/currencyInput";
import { addLeadingZeroLessTen, getLastDayOfMonth } from "../../utils";
import { Context } from "../../context/Context";

export default function ProfessorCalendar({ professor, courseId, enabledPeriods, payments }) {
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
                        return <NoPayments year={currentYear} month={month} professor={professor} courseId={courseId}/>;
                    } else {
                        return "no disponible";
                    }
                }
                if (!monthDetails.verified) {
                    return "pago sin verificar $" + monthDetails.payment.value *-1;
                }
                const hasMonthPaid = "payment" in monthDetails;
                const title = hasMonthPaid ? `$${monthDetails.payment.value *-1} por ${monthDetails.payment.type}` : "error";
                const monthStatus = "pago realizado $" + monthDetails.payment.value *-1;
                return (<Tooltip title={title}><span>{monthStatus}</span></Tooltip>)
            } else {
                return "no hay datos";
            }
        } catch {
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

function NoPayments({ month, year, courseId, professor }) {
    const { newProfessorPayment } = useContext(Context);
    const [addingPayment, setAddingPayment] = useState(false);
    const [value, setValue] = useState("");
    const currencyInputRef = React.createRef();

    const toggleAddingPayment = () => {
        setAddingPayment(!addingPayment);
        setValue("");
    }

    useEffect(() => {
        if (addingPayment && currencyInputRef !== null) {
            currencyInputRef.current.focus();
        }
    }, [addingPayment]);

    const handleOnCreatePayment = () => {
        const m = addLeadingZeroLessTen(month);
        const from = `${year}-${m}-01`;
        const to = `${year}-${m}-${getLastDayOfMonth(year, month)}`;
        newProfessorPayment(professor.id, courseId, from, to, value);
        toggleAddingPayment();
    }

    return !addingPayment ? 
    <>no hay pagos <span onClick={toggleAddingPayment} className="underline cursor-pointer">agregar</span></>
    : 
        <div className="flex flex-end items-center">
            <div className="w-2/6">
                <CurrencyInput
                    innerref={currencyInputRef}
                    value={value}
                    onChange={(e) => setValue(e)}
                />
            </div>
            <CheckIcon onClick={handleOnCreatePayment} className="mx-2 cursor-pointer"/>
            <CloseIcon onClick={toggleAddingPayment} className="cursor-pointer"/>
        </div>
}