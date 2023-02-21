import React, { useState } from "react";
import Chart from "../components/chart";
import ChartSelector from "../components/chartSelector";

export default function Balance(props) {

    const [currentChartSelected, setCurrentChartSelected] = useState("year");

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Balance</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 md:gap-x-4">
                    <div className="col-span-1">
                        <ChartSelector currentChartSelected={currentChartSelected} onChange={setCurrentChartSelected}/>
                    </div>
                    <div className="col-span-3">
                        <Chart currentChartSelected={currentChartSelected}/>
                    </div>
                </div>
                </div>
            </div>
        </>
    );
} 