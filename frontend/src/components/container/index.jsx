import React from "react";
import Breadcrumb from "../breadcrumb/breadcrumb";
import { COLORS } from "../../constants";

export default function Container({ children, title, disableTitle = false, className, items = [] }) {

    return(
        <>
        <div style={{ backgroundColor: COLORS.primary[50] }} className={`sm:px-8 md:pl-10 sm:py-8 max-w-7xl mx-auto ${className}`}>
            <Breadcrumb className={"sm:mt-8 mt-2 sm:absolute ml-4 sm:ml-8"} items={items}/>
            <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-8 mb-5 mt-2 sm:mt-6 md:mt-16">
                {!disableTitle && <h1 style={{ color: COLORS.primary[900] }} className="text-2xl md:text-3xl text-center font-bold mb-12">{title}</h1>}
                {children}
            </div>
        </div>
        </>
    );
} 