import React from "react";

export default function RedBudget({ children, className }) {
    
    return (<span className={className + " bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded light:bg-gray-700 light:text-red-400 border border-red-400"}>{children}</span>);
} 