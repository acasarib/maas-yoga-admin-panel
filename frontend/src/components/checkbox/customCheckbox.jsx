import React from "react";
import Checkbox from '@mui/material/Checkbox';
import { orange } from '@mui/material/colors';

export default function CustomCheckbox({ checked, labelOn, labelOff, className = "", onChange = () => {}, disabled = false }) {

    return(
        <>
            <div className={`${className}`}>
                <Checkbox onChange={onChange} checked={checked} disabled={disabled} sx={{
                      color: orange[500],
                      '&.Mui-checked': {
                        color: orange[500],
                      },
                    }} name="checkbox"/>
                {checked ? labelOn : labelOff}
            </div>
        </>
    );
} 