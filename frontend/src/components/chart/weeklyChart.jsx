import React, { useEffect } from "react";
import { useState } from "react";
import { capitalizeFirstCharacter } from "../../utils";
import BarChart from "./barChart";

export default function WeeklyChart({ data, height }) {
    const [parsedData, setParsedData] = useState([]);
    const getMaxValue = (data) => Math.max(...Object.keys(data).map(weekDay => data[weekDay].value));

    useEffect(() => {
        const parsedData = {
            "Lun": { value: 0, percentage: 0 },
            "Mar": { value: 0, percentage: 0 },
            "Mié": { value: 0, percentage: 0 },
            "Jue": { value: 0, percentage: 0 },
            "Vie": { value: 0, percentage: 0 },
            "Sab": { value: 0, percentage: 0 },
            "Dom": { value: 0, percentage: 0 },
        };
        if (data && data.length > 0) {
            data.sort((a, b) => new Date(a.at) < new Date(b.at) ? -1 : 1);
            data.forEach(d => {
                const at = new Date(d.at);
                const weekDay = capitalizeFirstCharacter(at.toLocaleDateString('es-ES', { weekday: 'short' }));
                parsedData[weekDay].value += d.value;
            });
            const maxValue = getMaxValue(parsedData);
            Object.keys(parsedData).forEach(weekDay =>
                parsedData[weekDay].percentage = parsedData[weekDay].value / maxValue * 100
            );
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