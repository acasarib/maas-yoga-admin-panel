import React from "react";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { COLORS } from "../../constants";

export default function CustomRadio({ value, label, className = "", sx, ...radioProps }) {
    const { size, disabled } = radioProps;
    const sharedStyles = {
        color: COLORS.primary[500],
        '&.Mui-checked': {
            color: COLORS.primary[500],
        },
        ...sx,
    };

    if (label === undefined || label === null) {
        return (
            <Radio
                {...radioProps}
                className={className}
                value={value}
                size={size || "small"}
                disabled={disabled}
                sx={sharedStyles}
            />
        );
    }

    return (
        <FormControlLabel
            className={className}
            value={value}
            control={
                <Radio
                    {...radioProps}
                    size={size || "small"}
                    sx={sharedStyles}
                />
            }
            label={label}
            disableTypography
            disabled={disabled}
        />
    );
}