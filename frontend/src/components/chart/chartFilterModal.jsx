import React from "react";
import BalanceIcon from '@mui/icons-material/Balance';
import Modal from "../modal";

export default function ChartFilterModal({ isOpen, closeModal, onApplyFilter }) {

    return (
    <Modal
        icon={<BalanceIcon />}
        open={isOpen}
        setDisplay={closeModal}
        buttonText={"Aplicar"}
        title="Balance de pagos"
        onClick={onApplyFilter}
    >
        
    </Modal>
    );
} 