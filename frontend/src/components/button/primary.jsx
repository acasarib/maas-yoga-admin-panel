import React from "react";

export default function ButtonPrimary({ onClick, className, children, disabled }) {

    return (
    <button
        type="button"
        disabled={disabled}
        className={`${!disabled && "hover:bg-orange-550 bg-orange-300 hover:text-white"}  inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${className}`}
        onClick={onClick}
        >
            {children}
    </button>);
} 