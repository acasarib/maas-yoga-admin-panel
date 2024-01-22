import React, { useState } from "react";
import Chart from "../components/chart";
import ChartSelector from "../components/chartSelector";
import ChartFilterModal from "../components/chart/chartFilterModal";
import PaymentsTable from "../components/paymentsTable";
import Container from "../components/container";

export default function Balance(props) {

    const [currentChartSelected, setCurrentChartSelected] = useState("year");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customChainFilters, setCustomChainFilters] = useState([]);
    const [chartByCreatedAt, setChartByCreatedAt] = useState(false);
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

    const handleOnDeletePayment = paymentId => setPayments(current => current.filter(p => p.id !== paymentId));
    
    return(
        <>
            <Container title="Balance">
                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-4 mb-14">
                    <div className="col-span-1">
                        <ChartSelector allowCustom currentChartSelected={currentChartSelected} onChange={handleChangeSelector}/>
                    </div>
                    <div className="col-span-3">
                        <Chart
                            chartByCreatedAt={chartByCreatedAt}
                            setChartByCreatedAt={setChartByCreatedAt}
                            customChainFilters={customChainFilters}
                            currentChartSelected={currentChartSelected}
                            onChangeData={data => setPayments(data)}    
                            />
                    </div>
                </div>
                <PaymentsTable editMode={false} dateField={chartByCreatedAt ? "createdAt" : "at"} className="mt-4" onDelete={handleOnDeletePayment} payments={payments} isLoading={false}/>
            </Container>
            <ChartFilterModal isOpen={isModalOpen} closeModal={switchModal} onApplyFilter={onApplyFilter} />
        </>
    );
} 