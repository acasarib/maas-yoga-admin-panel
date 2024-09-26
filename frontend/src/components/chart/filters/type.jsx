import React, { useState } from "react";
import { PAYMENT_OPTIONS } from "../../../constants";
import Select from "../../select/select";

export default function FilterPaymentType({ onChange }) {

    const [selectedPayment, setSelectedPayment] = useState(null);

    const handleOnChange = (selectedPayment) => {
        setSelectedPayment(selectedPayment);
        onChange(`type eq ${selectedPayment.value}`);
    }

    return (
    <div className="payment-filter-width">
        <span className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</span>
        <div className="mt-4"><Select value={selectedPayment} onChange={handleOnChange} options={PAYMENT_OPTIONS} /></div>
    </div>
    );
} 