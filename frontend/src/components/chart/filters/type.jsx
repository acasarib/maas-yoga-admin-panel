import React, { useState } from "react";
import { PAYMENT_OPTIONS } from "../../../constants";
import Select from "../../select/select";
import Label from "../../label/label";

export default function FilterPaymentType({ onChange }) {

    const [selectedPayment, setSelectedPayment] = useState(null);

    const handleOnChange = (selectedPayment) => {
        setSelectedPayment(selectedPayment);
        onChange(`type eq ${selectedPayment.value}`);
    }

    return (
    <div className="payment-filter-width">
        <Label htmlFor="paymentType">Modo de pago</Label>
        <Select name="paymentType" value={selectedPayment} onChange={handleOnChange} options={PAYMENT_OPTIONS} />
    </div>
    );
} 