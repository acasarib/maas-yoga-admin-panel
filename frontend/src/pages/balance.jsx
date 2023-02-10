import React from "react";
import Chart from "../components/chart";

export default function Balance(props) {

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Balance</h1>
                <Chart />
                </div>
            </div>
        </>
    );
} 