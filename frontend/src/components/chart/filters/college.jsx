import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";

export default function FilterPaymentCollege({ onChange }) {
    const [selectedCollege, setSelectedCollege] = useState(null);
    const { colleges } = useContext(Context);
    
    useEffect(() => {
        if (selectedCollege !== null)
            onChange(`headquarterId eq ${selectedCollege.id}`);
    }, [selectedCollege]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Sede</span>
        <div className="flex">
            <Select className="payment-filter-width" options={colleges} value={selectedCollege} onChange={setSelectedCollege}/>
        </div>
    </div>
    );
} 