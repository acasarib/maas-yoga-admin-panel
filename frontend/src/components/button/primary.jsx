import React, { useState } from "react";
import { COLORS } from "../../constants";

export default function ButtonPrimary({ onClick, className, children, disabled, ref }) {

    const [hovered, setHovered] = useState(false);
    const bg = disabled ? undefined : (hovered ? COLORS.primary[550] : COLORS.primary[300]);

    return (
    <button
        type="submit"
        ref={ref}
        disabled={disabled}
        style={{ backgroundColor: bg }}
        className={`${!disabled ? "hover:text-white hover:shadow-lg" : "bg-disabled"}  rounded-md border border-transparent px-4 py-2 text-base font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2 sm:text-sm transition-all duration-200 ease-in-out transform ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        >
            {children}
    </button>);
} 