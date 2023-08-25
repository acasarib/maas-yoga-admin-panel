import React, { useEffect, useState } from "react";
import { capitalizeFirstCharacter } from "../../utils";
import BarChart from "./barChart";

export default function YearlyChart({ data, height, field }) {
    const [parsedData, setParsedData] = useState([]);
    const getMaxValue = (data) => Math.max(...Object.keys(data).map(month => data[month].value));

    useEffect(() => {
        const parsedData = {
            "Ene": { value: 0, percentage: 0 },
            "Feb": { value: 0, percentage: 0 },
            "Mar": { value: 0, percentage: 0 },
            "Abr": { value: 0, percentage: 0 },
            "May": { value: 0, percentage: 0 },
            "Jun": { value: 0, percentage: 0 },
            "Jul": { value: 0, percentage: 0 },
            "Ago": { value: 0, percentage: 0 },
            "Sept": { value: 0, percentage: 0 },
            "Oct": { value: 0, percentage: 0 },
            "Nov": { value: 0, percentage: 0 },
            "Dic": { value: 0, percentage: 0 },
        };
        if (data && data.length > 0) {
            data.sort((a, b) => new Date(a[field]) < new Date(b[field]) ? -1 : 1);
            data.forEach(payment => {
                const paymentAt = new Date(payment[field]);
                const atMonth = capitalizeFirstCharacter(paymentAt.toLocaleDateString('es-ES', { month: 'short' }));
                parsedData[atMonth].value += payment.value;
            })
            const maxValue = getMaxValue(parsedData);
            Object.keys(parsedData).forEach(month => 
                parsedData[month].percentage = parsedData[month].value / maxValue * 100);
        }
        setParsedData(parsedData);
    }, [data]);
    

    return (
        <div style={{height}} className="flex items-end flex-grow w-full mt-2 space-x-2 sm:space-x-3">
            {Object.keys(parsedData).map((month, i) => 
                <BarChart key={i} percentage={parsedData[month].percentage} value={parsedData[month].value} title={month}/>
            )}
        </div>
    );
} 