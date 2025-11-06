import React from 'react'
import { Tooltip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { COLORS } from '../../constants';

const DownloadButton = (props) => {
  return (
    <Tooltip title="Descargar comprobante">
      <button
        className={`rounded-full p-1 mx-1 hover:bg-gray-200 border border-gray-300 text-gray-700 transition-all duration-200 ease-in-out transform hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary[500]}] focus:ring-offset-2`}
        {...props}
      >
        <DownloadIcon />
      </button>
    </Tooltip>
  )
}

export default DownloadButton