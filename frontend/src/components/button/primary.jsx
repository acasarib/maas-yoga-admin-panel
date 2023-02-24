import React from "react";

export default function ButtonPrimary({ onClick, className, children }) {

    return (
    <button
        type="button"
        className={`inline-flex w-full justify-center rounded-md border border-transparent bg-orange-300 px-4 py-2 text-base font-medium text-yellow-900 shadow-sm hover:bg-orange-550 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm ${className}`}
        onClick={onClick}
        >
            {children}
    </button>);
} 