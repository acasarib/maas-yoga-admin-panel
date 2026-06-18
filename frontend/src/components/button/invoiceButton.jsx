import React, { useState } from 'react'
import ReceiptIcon from '@mui/icons-material/Receipt';
import { Tooltip } from '@mui/material';

const InvoiceButton = ({ className = '', ...props }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Tooltip title="Emitir factura AFIP">
      <button
        style={{ backgroundColor: hovered ? '#d1fae5' : '#ecfdf5' }}
        className={`rounded-full p-1 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...props}
      >
        <ReceiptIcon style={{ color: '#059669' }} />
      </button>
    </Tooltip>
  );
};

export default InvoiceButton;
