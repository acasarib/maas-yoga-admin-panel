import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip } from '@mui/material';

const DeleteButton = (props) => {
  return (<Tooltip title="Eliminar">
    <button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" {...props}><DeleteIcon /></button>
  </Tooltip>)
}

export default DeleteButton