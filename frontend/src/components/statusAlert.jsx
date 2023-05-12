import React, { useEffect, useState, useContext } from "react";
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Context } from "../context/Context";

const DescriptionAlerts = ({status, message}) => {
  return (
    <Stack sx={{ width: '100%' }} spacing={2}>
      {(status === 'error') && (<Alert severity="error">
        {message}
      </Alert>)}
      {(status === 'success') && (<Alert severity="success">
        {message}
      </Alert>)}
    </Stack>
  );
}

export default function AlertPortal() {
  const { changeAlertStatusAndMessage, isAlertActive, alertMessage, alertStatus } = useContext(Context);

    useEffect(() => {
        window.setTimeout(() => changeAlertStatusAndMessage(false, 'success', 'La clase fue creada exitosamente!'), 5000);
    }, [])

    return(
        <>
            {isAlertActive && (<DescriptionAlerts status={alertStatus} message={alertMessage} />)}       
        </>
    )
}
