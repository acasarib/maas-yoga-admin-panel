import React from "react";

export default function CommonInput(props) {

    const handleOnKeyDown = (event) => {
        if (event.key === "Enter" && typeof props.onPressEnter === "function")
            props.onPressEnter();
        if (typeof props.onKeyDown === "function")
            props.onKeyDown();
    }

    return(
        <>
            <label className={props.className ? props.className : "block text-gray-700 text-sm font-bold mb-2"} htmlFor="email">
                {props.label}
            </label>
            <input className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`} 
                id={props.id} 
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={props.onChange}
                onFocus={props.onFocus}
                onBlur={props.onBlur}
                value={props.value}
                autoComplete={props.autoComplete}
                name={props.name}
                role={props.role}
                htmlFor={props.htmlFor}
                min={props.min}
                disabled={props.disabled}
                onKeyDown={handleOnKeyDown}
            />
            {props.isInvalid === true && 
            <div className="text-red-600">{props.invalidMessage}</div>
            }
        </>
    );
} 