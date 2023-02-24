import React from "react";

export default function CommonInput(props) {

    return(
        <>
            <label className={props.className ? props.className : "block text-gray-700 text-sm font-bold mb-2"} for="email">
                {props.label}
            </label>
            <input className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`} 
                id={props.id} 
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