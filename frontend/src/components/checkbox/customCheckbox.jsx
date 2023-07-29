import React from "react";
import Checkbox from '@mui/material/Checkbox';

export default function CustomCheckbox({ checked, labelOn, labelOff, className = "", onChange = () => {} }) {

    return(
        <>
            <div className={`${className}`}>
                <Checkbox onChange={onChange} checked={checked} />
                {checked ? labelOn : labelOff}
            </div>
        </>
    );
} 