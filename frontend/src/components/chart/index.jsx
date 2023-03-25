import React, { useEffect } from "react";
import paymentsService from "../../services/paymentsService";
import { useState } from "react";
import YearlyChart from "./yearlyChart";
import MonthlyChart from "./monthlyChart";
import WeeklyChart from "./weeklyChart";
import { capitalizeFirstCharacter, dateDiffInDays, formatDateDDMMYY } from "../../utils";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import InfoIcon from '@mui/icons-material/Info';
import Modal from "../modal";
import ButtonPrimary from "../button/primary";
import PaymentInfo from "../paymentInfo";

export default function Chart({ currentChartSelected, customChainFilters, onChangeData }) {

    const [data, setData] = useState(null);
    const [currentChartBy, setCurrentChartBy] = useState("year")
    const [chartTitle, setChartTitle] = useState("anual");
    const [chartPeriod, setChartPeriod] = useState(new Date().getFullYear());
    const [chartPeriodIterator, setChartPeriodIterator] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const switchModal = () => setIsModalOpen(!isModalOpen);

    const onClickPreviousArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) - 1);
    const onClickNextArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) + 1);

    const getMonthName = date => capitalizeFirstCharacter(date.toLocaleDateString('es-ES', { month: 'long' }));

    const onChangeYearData = response => {
        setData(response.data);
        setChartTitle("anual");
        setCurrentChartBy("year");
        setChartPeriod(new Date(response.period.from).getFullYear());
    };
    
    const onChangeMonthData = response => {
        setData(response.data);
        setChartTitle("mensual");
        setCurrentChartBy("month");
        const month = getMonthName(new Date(response.period.from));
        setChartPeriod(month);
    };

    const onChangeWeekData = response => {
        setData(response.data);
        const from = new Date(response.period.from);
        let to = new Date(response.period.to);
        setChartTitle("semanal");
        setCurrentChartBy("week");
        setChartPeriod(`${formatDateDDMMYY(from)} - ${formatDateDDMMYY(to)}`);
    };

    const onChangeCustomData = data => {
        setData(data);
    }

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
        const fetchDataByChainFilters = async () => {
            const response = await paymentsService.getByQuery(customChainFilters);
            onChangeCustomData(response);
        };
        if (currentChartSelected === "year")
            fetchDataByYear();
        if (currentChartSelected === "month")
            fetchDataByMonth();
        if (currentChartSelected === "week")
            fetchDataByWeek();
        if (currentChartSelected === "custom")
            fetchDataByChainFilters();
        setChartPeriodIterator(false);
    }, [currentChartSelected, customChainFilters]);

    useEffect(() => {
        if (data && currentChartSelected === "custom") {
            const dates = data.map(payment => new Date(payment.at).getTime());
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            const diffDays = dateDiffInDays(maxDate, minDate);
            if (diffDays <= 7) {
                setChartTitle("semanal");
                setChartPeriod(`${formatDateDDMMYY(minDate)} - ${formatDateDDMMYY(maxDate)}`);
                setCurrentChartBy("week");
            } else if (minDate.getMonth() === maxDate.getMonth()) {
                setChartTitle("mensual");
                const month = getMonthName(minDate);
                setChartPeriod(month);
                setCurrentChartBy("month");
            } else {
                setChartTitle("anual");
                setChartPeriod(minDate.getFullYear());
                setCurrentChartBy("year");
            }
        }
        onChangeData(data !== null ? data : []);
    }, [data, currentChartSelected]);

    return (
        <>
        <div className="flex flex-col items-center justify-center text-gray-700">
            <div className="flex flex-col items-center w-full max-w-screen-md p-6 pb-6 bg-orange-50 rounded-lg shadow-xl sm:p-8">
                <h2 className="text-xl font-bold">Balance {chartTitle}</h2>
                <span className="text-sm font-semibold text-gray-500 mb-4">{currentChartSelected !== "custom" && <ArrowLeftIcon onClick={onClickPreviousArrow} className="cursor-pointer"/>}{chartPeriod}{currentChartSelected !== "custom" && <ArrowRightIcon className="cursor-pointer" onClick={onClickNextArrow}/>}</span>
                
                {currentChartBy === "year" && <YearlyChart data={data} height={"300px"} />}
                {currentChartBy === "month" && <MonthlyChart data={data} height={"300px"} />}
                {currentChartBy === "week" && <WeeklyChart data={data} height={"300px"}/>}

                <div className="w-full mt-4">
                    <ButtonPrimary onClick={switchModal}>Ver detalle <InfoIcon className="ml-1"/></ButtonPrimary>
                </div>
                <Modal
                    open={isModalOpen}
                    setDisplay={switchModal}
                    style={{maxWidth: "50%"}}
                    buttonText={"Cerrar"}
                    icon={<InfoIcon/>}
                    title="Informacion del grafico"
                    onClick={switchModal}
                >
                    {data !== null && data.map(payment => <PaymentInfo key={payment.id} payment={payment} />)}
                </Modal>
            </div>
        </div>
        </>
    );
} 