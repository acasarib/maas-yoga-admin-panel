import React from "react";
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from "../../constants";

export default function PlusButton({ onClick, className, size = "large", }) {
    
    return (
        <button
            onClick={onClick}
            type="button"
            style={{ backgroundColor: COLORS.primary[300] }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary[550]; e.currentTarget.classList.add('hover:text-white','hover:shadow-lg'); }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = COLORS.primary[300]; e.currentTarget.classList.remove('hover:text-white','hover:shadow-lg'); }}
            className={`${size === "large" ? "w-14 h-14" : size == 'xs' ? 'w-5 h-5' : "w-7 h-7"} rounded-full border border-transparent flex justify-center items-center text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2 transition-all duration-200 ease-in-out transform ${className}`}
        >
            <AddIcon fontSize={size == 'xs' ? "small" : size} />
        </button>
    );
} 