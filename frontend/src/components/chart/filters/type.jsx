import React, { useState } from "react";
import Select from "react-select";
import { PAYMENT_OPTIONS } from "../../../constants";

export default function FilterPaymentType({ onChange }) {

    const [selectedPayment, setSelectedPayment] = useState(null);

    const handleOnChange = (selectedPayment) => {
        setSelectedPayment(selectedPayment);
        onChange(`type eq ${selectedPayment.value}`);
    }

    return (
    <div className="payment-filter-width">
        <span className="block text-gray-700 text-sm font-bold mb-2">Origen del pago</span>
        <div className="mt-4"><Select value={selectedPayment} onChange={handleOnChange} options={PAYMENT_OPTIONS} /></div>
    </div>
    );
} 