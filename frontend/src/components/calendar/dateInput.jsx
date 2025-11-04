import React from 'react'
import { DatePicker } from "@mui/x-date-pickers";
import { dateTimeInputStyles } from './dateTimeInput';
import Label from '../label/label';

const DateInput = ({ label, ...props }) => {
  return (
    <div className='flex flex-col'>
      <Label htmlFor={props.id || props.name}>{label}</Label>
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
    </div>
  )
}

export default DateInput;