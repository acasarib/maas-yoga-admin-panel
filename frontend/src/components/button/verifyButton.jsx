import React from 'react'
import { Tooltip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';

const VerifyButton = (props) => {
  return (<Tooltip title={props.tooltip ? props.tooltip : "Verificar"}>
    <button className={`rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1 ${props.invisible ? "invisible" : ""}`} {...props}><DoneIcon /></button>
  </Tooltip>)
}

export default VerifyButton;