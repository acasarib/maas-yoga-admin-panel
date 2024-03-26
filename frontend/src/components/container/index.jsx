import React from "react";
import Breadcrumb from "../breadcrumb/breadcrumb";

export default function Container({ children, title, disableTitle = false, className, items = [] }) {

    return(
        <>
        <div className={`sm:px-6 px-3 py-8 max-w-6xl mx-auto ${className}`}>
            <Breadcrumb className={"mt-4"} items={items}/>
            <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-5 mt-6 md:mt-16">
                {!disableTitle && <h1 className="text-2xl md:text-3xl text-center font-bold mb-12 text-yellow-900">{title}</h1>}
                {children}
            </div>
        </div>
        </>
    );
} 