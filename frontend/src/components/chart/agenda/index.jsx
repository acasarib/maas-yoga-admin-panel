import React, { useEffect } from "react";
import { useState } from "react";
import YearlyChart from "../yearlyChart";
import MonthlyChart from "../monthlyChart";
import WeeklyChart from "../weeklyChart";
import { capitalizeFirstCharacter } from "../../../utils";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import CustomCheckbox from "../../checkbox/customCheckbox";
import agendaService from '../../../services/agendaService'
import { COLORS } from '../../../constants';
import Loader from "../../spinner/loader";
import useToggle from "../../../hooks/useToggle";

export default function AgendaChart({ currentChartSelected, location }) {

    const [data, setData] = useState([]);
    const [chartTitle, setChartTitle] = useState("mensual");
    const isLoading = useToggle()
    const [chartPeriod, setChartPeriod] = useState(new Date().getFullYear());
    const [chartPeriodIterator, setChartPeriodIterator] = useState(false);
    const [accreditedOnly, setAccreditedOnly] = useState(true)
    const [localData, setLocalData] = useState([])

    const onClickPreviousArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) - 1);
    const onClickNextArrow = () => setChartPeriodIterator((chartPeriodIterator || 0) + 1);

    const getMonthName = date => capitalizeFirstCharacter(date.toLocaleDateString('es-ES', { month: 'long' }));
    
    const onChangeMonthData = (response, date) => {
        setData(response);
        setChartTitle("mensual");
        const month = getMonthName(date);
        setChartPeriod(month);
    };

    useEffect(() => {
        if (chartPeriodIterator === false || location === '') return;
        const now = new Date();
        const fetchDataByMonth = async () => {
            now.setMonth(now.getMonth() + chartPeriodIterator);
            isLoading.enable()
            let response = await agendaService.getCash(now.getFullYear(), now.getMonth()+1, location);
            isLoading.disable()
            response = response.map(r => ({...r, fecha: new Date(r.fecha)}))
            onChangeMonthData(response, now);
        };
        if (currentChartSelected === "month")
            fetchDataByMonth();
    }, [chartPeriodIterator, currentChartSelected, location]);
    
    useEffect(() => {
        setChartPeriodIterator(0);
    }, [currentChartSelected]);

    useEffect(() => {
        setLocalData(data.filter(cashValue => {
            if (accreditedOnly)
                return cashValue.acreditado == '1'
            else
                return cashValue.acreditado == '0'
            
        }))
    }, [data, accreditedOnly])
    

    return (
        <>
        <div className=" text-gray-700">
            <div style={{ backgroundColor: COLORS.primary[50] }} className="flex flex-col items-center w-full max-w-screen-md p-6 pb-6 rounded-lg shadow-xl sm:p-8">
                <h2 className="text-xl font-bold">Balance {chartTitle}</h2>
                <span className="text-sm font-semibold text-gray-500 mb-4">{<ArrowLeftIcon onClick={onClickPreviousArrow} className="cursor-pointer"/>}{chartPeriod}<ArrowRightIcon className="cursor-pointer" onClick={onClickNextArrow}/></span>
                {isLoading.value ? <Loader className="my-16" size={16}/> : <>
                    {currentChartSelected === "year"  && <YearlyChart  data={localData} field={"fecha"} height={"300px"} />}
                    {currentChartSelected === "month" && <MonthlyChart data={localData} field={"fecha"} height={"300px"} valueField={'valor'} />}
                    {currentChartSelected === "week"  && <WeeklyChart  data={localData} field={"fecha"} height={"300px"}/>}
                </>}
                <div className={'w-full mt-6'}>
                    <label style={{paddingLeft: "9px"}}>Acreditado</label>
                    <CustomCheckbox className="p-0" labelOn={"Si"} labelOff={"No"} onChange={() => setAccreditedOnly(!accreditedOnly)} checked={accreditedOnly}/>
                </div>  
            </div>
        </div>
        </>
    );
}
 