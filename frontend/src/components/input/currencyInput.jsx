import React, { useEffect, useState } from "react";

export default function CurrencyInput(props) {
    const [value, setValue] = useState("");

    useEffect(() => {
        setValue(props.value === "" ? "" : "$"+props.value);
    }, [props.value]);
    

    const handleOnChange = newValue => {
        const value = newValue.replaceAll("$", "");
        props.onChange(value);
    }

    return(
        <>
            <input 
                {...props}
                ref={props.innerref}
                className={`${props.className} shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`} 
                value={value}
                onChange={(e) => handleOnChange(e.target.value)}
            />
        </>
    );
} 