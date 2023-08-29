import React from "react";
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
export default function CustomRadio(props) {
    return <>
        <FormControlLabel value="female" control={<Radio {...props}/>} label={props.label} />
    </>
} 