import React, { useContext } from "react";
import { useEffect } from "react";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useState } from "react";
import GreenBudget from "../badget/green";
import PendingBudget from "../badget/pendingBudget";
import RedBudget from "../badget/red";
import { getMonthNames } from "../../utils";

export default function StudentCalendar({ periods }) {
    const [currentYear, setCurrentYear] = useState(null);
    const years = Object.keys(periods);
    const arrowLeftDisabled = years.filter(year => parseInt(year) < parseInt(currentYear)).length === 0;
    const arrowRightDisabled = years.filter(year => parseInt(year) > parseInt(currentYear)).length === 0;
    const monthNames = getMonthNames();

    const getMonthName = (month) => {
        return monthNames[parseInt(month)-1];
    }

    const getMonthDetail = month => {
        const status = periods[currentYear][month];
        if (status == 'paid') {
            return (<GreenBudget>Pagado</GreenBudget>);
        } else if (status == 'waiting') {
            return (<PendingBudget>Pendiente</PendingBudget>);
        } else if (status == 'not_paid') {
            return (<RedBudget>No pagado</RedBudget>);
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
    </>);
}