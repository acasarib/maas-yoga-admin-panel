import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";

export default function FilterPaymentClazz({ onChange }) {

    const { clazzes } = useContext(Context);
    const [selectedClazz, setSelectedClazz] = useState(null);
    
    useEffect(() => {
        if (selectedClazz !== null)
            onChange(`clazzId eq ${selectedClazz.id}`);
    }, [selectedClazz]);

    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Clase</span>
        <div className="flex">
            <Select className="payment-filter-width" options={clazzes} value={selectedClazz} onChange={setSelectedClazz}/>
        </div>
    </div>
    );
} 