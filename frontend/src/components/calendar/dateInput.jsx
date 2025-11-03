import React from 'react'
import { DatePicker } from "@mui/x-date-pickers";
import { dateTimeInputStyles } from './dateTimeInput';

const DateInput = (props) => {
  return (
    <DatePicker
      {...props} 
      sx={dateTimeInputStyles}
      slotProps={{
        openPickerIcon: { fontSize: 'small' },
        textField: {
          //size: 'small',
          inputProps: {
              "id": props.id || props.name,
              "name": props.name,
          }
        }
      }}
    />
  )
}

export default DateInput;