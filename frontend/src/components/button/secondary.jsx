import React from "react";
import { COLORS } from "../../constants";

export default function ButtonSecondary({ onClick, className, children, disabled, innerRef }) {

    return (
    <button
        type="button"
        ref={innerRef}
        disabled={disabled}
        style={{ color: COLORS.primary[900] }}
        className={`${!disabled ? "focus:outline-none focus:ring-2 focus:ring-gray-500 hover:bg-gray-100 bg-white border-gray-300 hover:shadow-md" : "bg-disabled"}  rounded-md border border-transparent px-4 py-2 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2 sm:text-sm transition-all duration-200 ease-in-out transform ${className}`}
        onClick={onClick}
        >
            {children}
    </button>);
}