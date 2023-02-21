import React, { useEffect } from "react";
import paymentsService from "../../services/paymentsService";
import { useState } from "react";
import YearlyChart from "./yearlyChart";
import MonthlyChart from "./monthlyChart";
import WeeklyChart from "./weeklyChart";
import { capitalizeFirstCharacter, formatDateDDMMYY } from "../../utils";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export default function Chart({ currentChartSelected }) {

    const [data, setData] = useState(null);
    const [chartTitle, setChartTitle] = useState("anual");
    const [chartPeriod, setChartPeriod] = useState(new Date().getFullYear());
    const [chartPeriodIterator, setChartPeriodIterator] = useState(false);

    const onClickPreviousArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) - 1);
    const onClickNextArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) + 1);

    const onChangeYearData = response => {
        setData(response.data);
        setChartTitle("anual");
        setChartPeriod(new Date(response.period.from).getFullYear());
    };
    
    const onChangeMonthData = response => {
        setData(response.data);
        setChartTitle("mensual");
        const month = new Date(response.period.from).toLocaleDateString('es-ES', { month: 'long' });
        setChartPeriod(capitalizeFirstCharacter(month));
    };

    const onChangeWeekData = response => {
        setData(response.data);
        const from = new Date(response.period.from);
        let to = new Date(response.period.to);
        setChartTitle("semanal");
        setChartPeriod(`${formatDateDDMMYY(from)} - ${formatDateDDMMYY(to)}`);
    };

    useEffect(() => {
        if (chartPeriodIterator === false) return;
        const now = new Date();
        const fetchDataByYear = async () => {
            now.setFullYear(now.getFullYear() + chartPeriodIterator);
            const response = await paymentsService.getAllByYear(now);
            onChangeYearData(response);
        };
        const fetchDataByMonth = async () => {
            now.setMonth(now.getMonth() + chartPeriodIterator);
            const response = await paymentsService.getAllByMonth(now);
            onChangeMonthData(response);
        };
        const fetchDataByWeek = async () => {
            now.setDate(now.getDate() + chartPeriodIterator * 7);
            const response = await paymentsService.getAllByWeek(now);
            onChangeWeekData(response);
        };
        if (currentChartSelected === "year")
            fetchDataByYear();
        if (currentChartSelected === "month")
            fetchDataByMonth();
        if (currentChartSelected === "week")
            fetchDataByWeek();
    }, [chartPeriodIterator]);
    

    useEffect(() => {
        const fetchDataByYear = async () => {
            const response = await paymentsService.getAllByYear();
            onChangeYearData(response);
        };
        const fetchDataByMonth = async () => {
            const response = await paymentsService.getAllByMonth();
            onChangeMonthData(response);
        };
        const fetchDataByWeek = async () => {
            const response = await paymentsService.getAllByWeek();
            onChangeWeekData(response);
        };
        if (currentChartSelected === "year")
            fetchDataByYear();
        if (currentChartSelected === "month")
            fetchDataByMonth();
        if (currentChartSelected === "week")
            fetchDataByWeek();
        setChartPeriodIterator(false);
    }, [currentChartSelected]);

    return (
        <>
        <div className="flex flex-col items-center justify-center text-gray-700">
            <div className="flex flex-col items-center w-full max-w-screen-md p-6 pb-6 bg-orange-50 rounded-lg shadow-xl sm:p-8">
                <h2 className="text-xl font-bold">Balance {chartTitle}</h2>
                <span className="text-sm font-semibold text-gray-500 mb-4"><ArrowLeftIcon onClick={onClickPreviousArrow} className="cursor-pointer"/>{chartPeriod}<ArrowRightIcon className="cursor-pointer" onClick={onClickNextArrow}/></span>
                
                {currentChartSelected === "year" && <YearlyChart data={data} height={"300px"} />}
                {currentChartSelected === "month" && <MonthlyChart data={data} height={"300px"} />}
                {currentChartSelected === "week" && <WeeklyChart data={data} height={"300px"}/>}

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