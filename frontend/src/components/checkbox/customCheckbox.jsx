import React from "react";
import Checkbox from '@mui/material/Checkbox';

export default function CustomCheckbox({ checked, labelOn, labelOff, className = "", onChange = () => {}, disabled = false }) {

    return(
        <>
            <div className={`${className}`}>
                <Checkbox onChange={onChange} checked={checked} disabled={disabled} />
                {checked ? labelOn : labelOff}
            </div>
        </>
    );
} 