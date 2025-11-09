import React from "react";

export default function GreenBudget({ className = "", children }) {
    
    return (<span className={`${className} bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded light:bg-gray-700 light:text-green-400 border border-green-400`}>{children}</span>);
} 