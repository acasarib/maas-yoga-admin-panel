import React from 'react'
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Modal from '../../modal';

const WarningModal = ({ isOpen, onClose, children, title, hiddingButton = true, ...rest }) => {
  return (
    <Modal {...rest} hiddingButton={hiddingButton} open={isOpen} icon={<WarningAmberIcon/>} setDisplay={onClose} title={title}>
			{children}
    </Modal>
  )
}

export default WarningModal