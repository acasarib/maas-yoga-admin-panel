import React from "react";
import Checkbox from '@mui/material/Checkbox';
import { FormControlLabel } from "@mui/material";
import Label from "../label/label";
import { randomId } from "../../utils";
import { COLORS } from "../../constants";

export default function CustomCheckbox({ checked, label, labelOn, labelOff, className = "", onChange = () => {}, disabled = false }) {
    labelOn = labelOn ?? label
    labelOff = labelOff ?? label

    const id = `checkbox-${randomId(8)}`

    return(
        <>
            <div className={`${className}`}>
                <FormControlLabel
                    label={<Label className='cursor-pointer mb-0' htmlFor={id}>{checked ? labelOn : labelOff}</Label>}
                    control={
                        <Checkbox
                            inputProps={{
                                "id": id,
                                "name": id,
                            }}
                            onChange={onChange}
                            checked={checked}
                            disabled={disabled}
                            sx={{
                                color: COLORS.primary[500],
                                '&.Mui-checked': {
                                    color: COLORS.primary[500],
                                },
                            }}
                            name="checkbox"
                            id={id}
                        />
                    }
                />
            </div>
        </>
    );
} 