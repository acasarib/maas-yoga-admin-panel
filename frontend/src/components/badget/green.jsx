import React from "react";

export default function GreenBudget({ children }) {
    
    return (<span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded light:bg-gray-700 light:text-green-400 border border-green-400">{children}</span>);
} 