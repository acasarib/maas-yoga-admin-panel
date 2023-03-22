import React, { useState } from "react";
import Chart from "../components/chart";
import ChartSelector from "../components/chartSelector";
import ChartFilterModal from "../components/chart/chartFilterModal";
import PaymentsTable from "../components/paymentsTable";

export default function Balance(props) {

    const [currentChartSelected, setCurrentChartSelected] = useState("year");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customChainFilters, setCustomChainFilters] = useState([]);
    const [payments, setPayments] = useState([]);

    const switchModal = () => setIsModalOpen(!isModalOpen);

    const handleChangeSelector = selection => {
        if (selection === "custom")
            switchModal();
        else
            setCurrentChartSelected(selection);
    }

    const onApplyFilter = (chainFilters) => {
        setCustomChainFilters(chainFilters);
        setCurrentChartSelected("custom");
        switchModal();
    }
    
    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                    <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Balance</h1>
                    <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-4">
                        <div className="col-span-1">
                            <ChartSelector currentChartSelected={currentChartSelected} onChange={handleChangeSelector}/>
                        </div>
                        <div className="col-span-3">
                            <Chart
                                customChainFilters={customChainFilters}
                                currentChartSelected={currentChartSelected}
                                onChangeData={data => setPayments(data)}    
                            />
                        </div>
                    </div>
                    <PaymentsTable className="mt-4" payments={payments} isLoading={false}/>
                </div>
                <ChartFilterModal isOpen={isModalOpen} closeModal={switchModal} onApplyFilter={onApplyFilter} />
            </div>
        </>
    );
} 