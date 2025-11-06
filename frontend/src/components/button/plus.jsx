import React, { useState } from "react";
import AddIcon from '@mui/icons-material/Add';
import { COLORS } from "../../constants";

export default function PlusButton({ onClick, className, disabled, size = "large", }) {
    const [hovered, setHovered] = useState(false);
    const bg = disabled ? undefined : (hovered ? COLORS.primary[550] : COLORS.primary[300]);
    const color = disabled ? undefined : (hovered ? "white" : COLORS.primary[900]);
    
    return (
        <button
            onClick={onClick}
            type="button"
            style={{ backgroundColor: bg, color }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={`${size === "large" ? "w-14 h-14" : size == 'xs' ? 'w-5 h-5' : "w-7 h-7"} rounded-full border border-transparent flex justify-center items-center shadow-sm focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2 transition-all duration-200 ease-in-out transform ${className}`}
        >
            <AddIcon fontSize={size == 'xs' ? "small" : size} />
        </button>
    );
} 