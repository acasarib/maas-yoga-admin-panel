import React from "react";

export default function BarChart({ percentage, value, title }) {

    return (
    <div className="relative flex flex-col flex-col-reverse items-center flex-grow pb-5 group h-full">
        <span className="absolute top-0 hidden -mt-6 text-xs font-bold group-hover:block">{`$${value.toLocaleString("es-ES")}`}</span>
        <div style={{height: `${percentage}%`}} className="relative flex justify-center w-full h-16 bg-orange-400"></div>
        <span className="absolute bottom-0 text-xs font-bold">{title}</span>
    </div>
    );
} 