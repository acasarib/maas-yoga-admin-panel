import React from "react";
import { formatPaymentValue } from "../../utils";

export default function BarChart({ percentage, value, title }) {
    console.log(value);
    
    return (
        <div className="relative flex flex-col items-center group flex-grow h-full">

            <div className="absolute left-0 right-0 h-0.5 bg-gray-300" style={{ top: '50%' }}></div>

            <span className="absolute top-0 -mt-6 text-xs font-bold hidden group-hover:block">
                {formatPaymentValue(value, true)}
            </span>

            <div
                className={`absolute flex justify-center w-full ${
                    value >= 0 ? "bg-blue-400" : "bg-red-400"
                }`}
                style={{
                    height: `${Math.min(Math.abs(percentage/4), 45)}%`,
                    top: value < 0 ? '50%' : 'auto',
                    bottom: value >= 0 ? '50%' : 'auto',
                }}
            ></div>

            <span className="absolute bottom-0 text-xs font-bold">{title}</span>
        </div>
    );
}
