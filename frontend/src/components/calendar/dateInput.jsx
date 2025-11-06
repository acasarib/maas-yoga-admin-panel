import React, { useMemo, useState } from 'react'
import { DatePicker } from "@mui/x-date-pickers";
import { dateTimeInputStyles } from './dateTimeInput';
import Label from '../label/label';

const DateInput = ({ label, ...props }) => {

  const [error, setError] = useState(null);

  const errorMessage = useMemo(() => {
    switch (error) {
      case 'maxDate': 
      case 'minDate': {
        if (props.errorMessage) {
          return props.errorMessage;
        }
        return '';
      }

      case 'invalidDate': {
        return 'Fecha invalida';
      }

      default: {
        return '';
      }
    }
  }, [error]);

  return (
    <div className='flex flex-col'>
      <Label htmlFor={props.id || props.name}>{label}</Label>
      <DatePicker
        {...props} 
        onError={(newError) => setError(newError)}
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
      <div className="text-red-500 text-sm">{errorMessage}</div>
    </div>
  )
}

export default DateInput;