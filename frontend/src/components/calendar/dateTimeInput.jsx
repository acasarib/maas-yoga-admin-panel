import React from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Label from '../label/label';
export const dateTimeInputStyles = {
  '& .MuiInputLabel-shrink': {
    padding: '8px 0 0 0',
  },
  '& .MuiFormLabel-root': {
    margin: '-8px 0 0 0',
  },
  '& .MuiInputBase-root': {
    height: '38px',
    backgroundColor: 'white',
    paddingTop: '8px',
    paddingBottom: '8px',
    paddingLeft: '12px',
    paddingRight: '12px',
    overflow: 'hidden',
  },
  '& .MuiInputBase-input': {
    padding: '0',
    overflow: 'hidden',
  },
  '& .MuiOutlinedInput-root': {
    overflow: 'hidden',
  }
}
const DateTimeInput = ({ label, ...props }) => {
  return (
    <div className=''>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <DateTimePicker 
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

export default DateTimeInput;