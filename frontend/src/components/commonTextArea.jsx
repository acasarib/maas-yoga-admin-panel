import React from "react";

export default function CommonTextArea(props) {

    return(
        <>
            <label className={props.className ? props.className : "block text-gray-700 text-sm font-bold mb-2"} htmlFor={props.name}>
                {props.label}
            </label>
            <textarea className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800]`} 
                id={props.name} 
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={props.onChange}
                onBlur={props.onBlur}
                value={props.value}
                name={props.name}
                htmlFor={props.htmlFor}
            />
        </>
    );
} 