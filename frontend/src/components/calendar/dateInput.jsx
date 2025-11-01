import React from 'react'
import { DatePicker } from "@mui/x-date-pickers";
import { dateTimeInputStyles } from './dateTimeInput';

const DateInput = (props) => {
  return (
    <DatePicker
      {...props} 
      sx={dateTimeInputStyles}
    />
  )
}

export default DateInput;