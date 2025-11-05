import React from "react";
import CommonTextArea from "./commonTextArea";
import Label from "./label/label";

export default function CommonInput(props) {

    const handleOnKeyDown = (event) => {
        if (event.key === "Enter" && typeof props.onPressEnter === "function")
            props.onPressEnter();
        if (typeof props.onKeyDown === "function")
            props.onKeyDown();
    }

    if (props.type === 'textarea')
        return <div><CommonTextArea {...props}/></div>

    return(
        <div>
            <Label className={props.className ? props.className : ""} htmlFor={props.htmlFor || props.name}>
                {props.label}
            </Label>
            {props.currency === true || props.symbol ? (
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">{props.symbol || "$"}</span>
                    <input {...props} className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 pl-7 pr-3 text-gray-700 leading-tight focus:outline-none focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800]`} 
                        id={props.id || props.name}
                        onKeyDown={handleOnKeyDown}
                    />
                </div>
            ) : (
                <input {...props} className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:border-[#ff9800] focus:ring-1 focus:ring-[#ff9800]`} 
                    id={props.id || props.name}
                    onKeyDown={handleOnKeyDown}
                />
            )}
            
            {props.isInvalid === true && 
            <div className="text-red-600">{props.invalidMessage}</div>
            }
        </div>
    );
} 