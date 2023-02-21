import React, { useEffect } from "react";
import { useState } from "react";
import BarChart from "./barChart";

export default function MonthlyChart({ data, height }) {

    const [parsedData, setParsedData] = useState([]);
    const getMinDay = data => Math.min(...Object.keys(data));
    const getMaxDay = data => Math.max(...Object.keys(data));
    const getMaxValue = (data) => Math.max(...Object.keys(data).map(day => data[day].value));

    useEffect(() => {
        if (data) {
            const parsedData = {};
            data.sort((a, b) => new Date(a.at) < new Date(b.at) ? -1 : 1);
            data.forEach(d => {
                const at = new Date(d.at);
                const day = at.getDate();
                if (day in parsedData) {
                    parsedData[day].value += d.value;
                } else {
                    parsedData[day] = { value: d.value, percentage: 0 };
                }
            });
            const maxValue = getMaxValue(parsedData);
            for (let day = getMinDay(parsedData); day <= getMaxDay(parsedData); day++)
                if (day in parsedData)
                    parsedData[day].percentage = parsedData[day].value / maxValue * 100;
                else
                    parsedData[day] = { value: 0, percentage: 0 };
            setParsedData(parsedData);
        }
    }, [data]);
   

    return (
        <div style={{height}} className="flex items-end flex-grow w-full mt-2 space-x-2 sm:space-x-3">
            {Object.keys(parsedData).map((month, i) => 
                <BarChart key={i} percentage={parsedData[month].percentage} value={parsedData[month].value} title={month}/>
            )}
        </div>
    );
} 