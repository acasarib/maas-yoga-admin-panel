import React, { useEffect } from "react";
import paymentsService from "../../services/paymentsService";
import { useState } from "react";
import YearlyChart from "./yearlyChart";
import MonthlyChart from "./monthlyChart";
import WeeklyChart from "./weeklyChart";
import { capitalizeFirstCharacter } from "../../utils";

export default function Chart({ currentChartSelected }) {

    const [data, setData] = useState(null);
    const [chartTitle, setChartTitle] = useState("anual");
    const [chartPeriod, setChartPeriod] = useState(new Date().getFullYear())

    useEffect(() => {
        const fetchDataByYear = async () => {
            const data = await paymentsService.getAllByYear();
            setData(data);
        };
        const fetchDataByMonth = async () => {
            const data = await paymentsService.getAllByMonth();
            setData(data);
        };
        const fetchDataByWeek = async () => {
            const data = await paymentsService.getAllByWeek();
            setData(data);
        };
        if (currentChartSelected === "year")
            fetchDataByYear();
        if (currentChartSelected === "month")
            fetchDataByMonth();
        if (currentChartSelected === "week")
            fetchDataByWeek();
    }, [currentChartSelected]);

    useEffect(() => {
        const formatDate = date => `${date.getDate()}/${date.getMonth() +1}/${date.getFullYear()}`;
        if (currentChartSelected === "year") {
            setChartTitle("anual");
            setChartPeriod(new Date().getFullYear());
        }
        if (currentChartSelected === "month") {
            setChartTitle("mensual");
            const event = new Date();
            const month = event.toLocaleDateString('es-ES', { month: 'long' });
            setChartPeriod(capitalizeFirstCharacter(month));
        }
        if (currentChartSelected === "week") {
            const now = new Date();
            let prevMonday = new Date();
            prevMonday.setDate(prevMonday.getDate() - (prevMonday.getDay() == 1 ? 7 : (prevMonday.getDay() + (7 - 1)) % 7 ));
            setChartTitle("semanal");
            setChartPeriod(`${formatDate(prevMonday)} - ${formatDate(now)}`);
        }
    }, [data]);

    return (
        <>
        <div className="flex flex-col items-center justify-center text-gray-700">
            <div className="flex flex-col items-center w-full max-w-screen-md p-6 pb-6 bg-orange-50 rounded-lg shadow-xl sm:p-8">
                <h2 className="text-xl font-bold">Balance {chartTitle}</h2>
                <span className="text-sm font-semibold text-gray-500">{chartPeriod}</span>
                
                {currentChartSelected === "year" && <YearlyChart data={data} height={"302px"}/>}
                {currentChartSelected === "month" && <MonthlyChart data={data}/>}
                {currentChartSelected === "week" && <WeeklyChart data={data}/>}

                <div className="flex w-full mt-3">
                    <div className="flex items-center ml-auto">
                        <span className="block w-4 h-4 bg-orange-400"></span>
                        <span className="ml-1 text-xs font-medium">Existing</span>
                    </div>
                    <div className="flex items-center ml-4">
                        <span className="block w-4 h-4 bg-orange-300"></span>
                        <span className="ml-1 text-xs font-medium">Upgrades</span>
                    </div>
                    <div className="flex items-center ml-4">
                        <span className="block w-4 h-4 bg-orange-200"></span>
                        <span className="ml-1 text-xs font-medium">New</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
} 