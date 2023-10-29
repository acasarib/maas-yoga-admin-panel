import React from "react";

export default function BlueBudget({ children }) {
    
    return (<span className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded border border-blue-400">{children}</span>);
} 