import React from "react";
import { formatPaymentValue } from "../../../utils";


export default function TableSummary({ total, incomes, expenses }) {
    
    return(
        <div className="bg-orange-200 rounded-2xl px-8 py-4 mt-8 md:flex md:justify-between">
            <div className="md:mr-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Total: </span><span className={`${total >= 0 ? "text-gray-800" : "text-red-800"} w-full text-center font-bold bg-white ml-2 rounded-2xl py-2 px-3`}>{formatPaymentValue(total)}</span></div>
            <div className="mt-2 md:mt-0 md:mx-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Ingresos: </span><span className="w-full text-center text-gray-800 font-bold bg-white rounded-2xl py-2 px-3 ml-2">{formatPaymentValue(incomes)}</span></div>
            <div className="mt-2 md:mt-0 md:mx-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Egresos: </span><span className="w-full text-center text-red-800 font-bold bg-white rounded-2xl py-2 px-3 ml-2">{formatPaymentValue(expenses)}</span></div>
        </div>
    );
} 