import React from 'react'
import { Tooltip } from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';

const AddTaskButton = (props) => {
  return (<Tooltip title="Agregar tarea">
    <button className={`rounded-full p-1 bg-green-200 hover:bg-green-300 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform ${props.invisible ? "invisible" : ""}`} {...props}><DoneIcon /></button>
  </Tooltip>)
}

export default AddTaskButton;