import React from 'react'
import EditIcon from '@mui/icons-material/Edit';
import { Tooltip } from '@mui/material';

const EditButton = (props) => {
  return (<Tooltip title="Editar">
    <button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform" {...props}><EditIcon /></button>
  </Tooltip>)
}

export default EditButton