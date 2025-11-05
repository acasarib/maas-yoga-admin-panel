import React from "react";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { COLORS } from "../../constants";

export default function CustomRadio(props) {
    const { value, label, ...radioProps } = props;
    return <>
        <FormControlLabel 
            value={value} 
            control={
                <Radio 
                    {...radioProps}
                    sx={{
                        color: COLORS.primary[500],
                        '&.Mui-checked': {
                            color: COLORS.primary[500],
                        },
                    }}
                />
            } 
            label={label} 
        />
    </>
} 