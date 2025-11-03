import React from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
export const dateTimeInputStyles = {
  '& .MuiInputLabel-shrink': {
    padding: '8px 0 0 0',
  },
  '& .MuiFormLabel-root': {
    margin: '-8px 0 0 0',
  },
  '& .MuiInputBase-root': {
    height: '38px',
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
const DateTimeInput = (props) => {
  return (
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
  )
}

export default DateTimeInput;