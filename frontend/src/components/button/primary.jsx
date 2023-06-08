import React from "react";

export default function ButtonPrimary({ onClick, className, children, disabled, ref }) {

    return (
    <button
        type="button"
        ref={ref}
        disabled={disabled}
        className={`${!disabled ? "hover:bg-orange-550 bg-orange-300 hover:text-white" : "bg-disabled"}  rounded-md border border-transparent px-4 py-2 text-base font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm ${className}`}
        onClick={onClick}
        >
            {children}
    </button>);
} 