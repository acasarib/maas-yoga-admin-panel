import React from "react";

export default function YellowBudget({ children, className }) {
    
    return (<span className={`bg-yellow-100 text-yellow-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border border-yellow-400 ${className}`}>{children}</span>);
} 