import React, { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import { Tooltip } from '@mui/material';
import { COLORS } from '../../constants';

const EditButton = (props) => {
  const [hovered, setHovered] = useState(false);
  const bg = hovered ? COLORS.primary[300] : COLORS.primary[200];
  return (<Tooltip title="Editar">
    <button
      style={{ backgroundColor: bg }}
      className="rounded-full p-1 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      <EditIcon />
    </button>
  </Tooltip>)
}

export default EditButton