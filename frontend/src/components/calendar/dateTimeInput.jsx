import React from 'react'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
export const dateTimeInputStyles = {
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
    />
  )
}

export default DateTimeInput;