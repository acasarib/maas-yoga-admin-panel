import React, { useState } from "react";
import { COLORS } from "../constants";

export default function CommonTextArea(props) {

    const [focused, setFocused] = useState(false);
    return(
        <>
            <label className={props.className ? props.className : "block text-gray-700 text-sm font-bold mb-2"} htmlFor={props.name}>
                {props.label}
            </label>
            <textarea
                className={`${props.inputClassName} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none`} 
                style={{
                    borderColor: focused ? COLORS.primary[500] : undefined,
                    boxShadow: focused ? `0 0 0 1px ${COLORS.primary[500]}` : undefined,
                }}
                id={props.name} 
                type={props.type} 
                placeholder={props.placeholder} 
                onChange={props.onChange}
                onFocus={(e) => { setFocused(true); if (typeof props.onFocus === 'function') props.onFocus(e); }}
                onBlur={(e) => { setFocused(false); if (typeof props.onBlur === 'function') props.onBlur(e); }}
                value={props.value}
                name={props.name}
                htmlFor={props.htmlFor}
            />
        </>
    );
} 