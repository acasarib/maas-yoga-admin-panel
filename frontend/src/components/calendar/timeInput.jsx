import React from 'react'
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { dateTimeInputStyles } from './dateTimeInput';

const TimeInput = (props) => {
  return (
    <TimePicker
      ampm={false}
      format="HH:mm"
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
      {...props}
    />
  )
}

export default TimeInput;