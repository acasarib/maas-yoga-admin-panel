import React, { useState } from "react";
import { COLORS } from "../../constants";
import Loader from "../../components/spinner/loader";

export default function ButtonPrimary({ onClick, isLoading = false, className, children, disabled, ref }) {

    const [hovered, setHovered] = useState(false);
    const bg = disabled ? undefined : (hovered ? COLORS.primary[550] : COLORS.primary[300]);
    const color = disabled ? undefined : (hovered ? "white" : COLORS.primary[900]);

    return (
    <button
        type="submit"
        ref={ref}
        disabled={disabled}
        style={{ backgroundColor: bg, color }}
        className={`${!disabled ? "hover:text-white hover:shadow-lg" : "bg-disabled"} flex justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2 sm:text-sm transition-all duration-200 ease-in-out transform items-center ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        >
            {isLoading && <Loader className="mr-2" size={5}/>}{children}
    </button>);
} 