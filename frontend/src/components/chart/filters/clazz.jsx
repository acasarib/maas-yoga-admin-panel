import React, { useEffect, useState } from "react";
import SelectClass from "../../select/selectClass";
import Label from "../../label/label";

export default function FilterPaymentClazz({ onChange }) {

    const [selectedClazz, setSelectedClazz] = useState(null);
    
    useEffect(() => {
        if (selectedClazz !== null)
            onChange(`clazzId eq ${selectedClazz.id}`);
    }, [selectedClazz]);
    
    return (
    <div>
        <Label htmlFor="clazz">Clase</Label>
        <div className="flex">
            <SelectClass
                name="clazz"
                className="payment-filter-width"
                value={selectedClazz}
                onChange={setSelectedClazz}
            />
        </div>
    </div>
    );
} 