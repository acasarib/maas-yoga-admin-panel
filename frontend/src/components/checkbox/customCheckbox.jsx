import React from "react";
import Checkbox from '@mui/material/Checkbox';
import { orange } from '@mui/material/colors';
import { FormControlLabel } from "@mui/material";

export default function CustomCheckbox({ checked, label, labelOn, labelOff, className = "", onChange = () => {}, disabled = false }) {
    labelOn = labelOn ?? label
    labelOff = labelOff ?? label

    return(
        <>
            <div className={`${className}`}>
                <FormControlLabel
                    label={checked ? labelOn : labelOff}
                    control={
                        <Checkbox
                            onChange={onChange}
                            checked={checked}
                            disabled={disabled}
                            sx={{
                                color: orange[500],
                                '&.Mui-checked': {
                                    color: orange[500],
                                },
                            }}
                            name="checkbox"
                        />
                    }
                />
            </div>
        </>
    );
} 