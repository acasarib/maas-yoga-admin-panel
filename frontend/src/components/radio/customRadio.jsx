import React from "react";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { orange } from '@mui/material/colors';

export default function CustomRadio(props) {
    const { value, label, ...radioProps } = props;
    return <>
        <FormControlLabel 
            value={value} 
            control={
                <Radio 
                    {...radioProps}
                    sx={{
                        color: orange[500],
                        '&.Mui-checked': {
                            color: orange[500],
                        },
                    }}
                />
            } 
            label={label} 
        />
    </>
} 