import React, { useEffect, useState } from "react";
import SelectClass from "../../select/selectClass";

export default function FilterPaymentClazz({ onChange }) {

    const [selectedClazz, setSelectedClazz] = useState(null);
    
    useEffect(() => {
        if (selectedClazz !== null)
            onChange(`clazzId eq ${selectedClazz.id}`);
    }, [selectedClazz]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Clase</span>
        <div className="flex">
            <SelectClass
                className="payment-filter-width"
                value={selectedClazz}
                onChange={setSelectedClazz}
            />
        </div>
    </div>
    );
} 