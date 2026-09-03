import React from 'react'
import RestoreIcon from '@mui/icons-material/Restore';
import { Tooltip } from '@mui/material';

const RestoreButton = (props) => {
  return (<Tooltip title="Restaurar">
    <button className="rounded-full p-1 bg-green-200 hover:bg-green-300 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform" {...props}><RestoreIcon /></button>
  </Tooltip>)
}

export default RestoreButton