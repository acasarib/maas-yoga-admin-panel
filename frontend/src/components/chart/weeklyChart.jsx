import React, { useEffect } from "react";
import { useState } from "react";
import { capitalizeFirstCharacter } from "../../utils";
import BarChart from "./barChart";

export default function WeeklyChart({ data, height, field }) {
    const [parsedData, setParsedData] = useState([]);
    const getMaxValue = (data) => Math.max(...data.map(d => d.value));

    const completeDays = data => {
        let weekDays = ["Lun", "Mar", "Mié", "Jue", "Víe", "Sáb", "Dom"];
        if (data.length === 0) return [];
        const firstDay = data[0];
        let index = weekDays.indexOf(firstDay.weekDay);
        const rest = weekDays.splice(index);
        weekDays = rest.concat(weekDays);
        return weekDays.map(weekDay => {
            const dataByWeekDay = data.find(d => d.weekDay === weekDay);
            return dataByWeekDay !== undefined ? dataByWeekDay : { weekDay, value: 0, percentage: 0 };
        });
    }

    useEffect(() => {
        const parsedData = [];
        if (data && data.length > 0) {
            data.sort((a, b) => new Date(a[field]) < new Date(b[field]) ? -1 : 1);
            data.forEach(d => {
                const at = new Date(d[field]);
                const weekDay = capitalizeFirstCharacter(at.toLocaleDateString('es-ES', { weekday: 'short' }));
                const currentWeekDayValue = parsedData.find(d => d.weekDay === weekDay);
                if (currentWeekDayValue)
                    currentWeekDayValue.value += d.value;
                else
                    parsedData.push({ weekDay, value: d.value, percentage: 0 });
            });
            const maxValue = getMaxValue(parsedData);
            parsedData.forEach(d => d.percentage = d.value / maxValue * 100);
        }
        setParsedData(completeDays(parsedData));
    }, [data]);
   
    return (
        <div style={{height}} className="flex items-end flex-grow w-full mt-2 space-x-2 sm:space-x-3">
            {parsedData.map(d => 
                <BarChart key={d.weekDay} percentage={d.percentage} value={d.value} title={d.weekDay}/>
            )}
        </div>
    );
} 