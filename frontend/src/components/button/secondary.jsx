import React from "react";

export default function ButtonSecondary({ onClick, className, children, disabled, innerRef }) {

    return (
    <button
        type="button"
        ref={innerRef}
        disabled={disabled}
        className={`${!disabled ? "focus:outline-none focus:ring-2 focus:ring-gray-500 hover:bg-gray-100 bg-white border-gray-300 text-yellow-900" : "bg-disabled"}  rounded-md border border-transparent px-4 py-2 font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm ${className}`}
        onClick={onClick}
        >
            {children}
    </button>);
} 