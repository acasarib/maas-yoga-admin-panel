import React, { useContext } from "react";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Context } from "../context/Context";

const DescriptionAlerts = () => {
  const { changeAlertStatusAndMessage, isAlertActive, alertMessage, alertStatus } = useContext(Context);

  return (
    <Stack sx={{ width: '100%' }} spacing={4}>
      <Snackbar open={isAlertActive} autoHideDuration={6000} onClose={() => changeAlertStatusAndMessage(false, '', '')}  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={alertStatus}>
          {alertMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}

export default function AlertPortal() {
  const { isAlertActive } = useContext(Context);

    return(
        <>
            {isAlertActive && (<DescriptionAlerts />)}      
        </>
    )
}
