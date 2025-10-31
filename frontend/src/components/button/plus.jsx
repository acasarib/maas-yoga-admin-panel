import React from "react";
import AddIcon from '@mui/icons-material/Add';

export default function PlusButton({ onClick, className, size = "large", }) {
    
    return (
        <button
            onClick={onClick}
            type="button"
            className={`bg-orange-300 hover:bg-orange-550 hover:text-white hover:shadow-lg ${size === "large" ? "w-14 h-14" : "w-7 h-7"} rounded-full border border-transparent flex justify-center items-center text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 ease-in-out transform ${className}`}
        >
            <AddIcon fontSize={size} />
        </button>
    );
} 