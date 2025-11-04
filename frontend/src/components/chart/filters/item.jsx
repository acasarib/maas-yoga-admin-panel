import React, { useEffect, useState } from "react";
import SelectItem from "../../select/selectItem";
import Label from "../../label/label";

export default function FilterPaymentItem({ onChange }) {

    const [selectedItem, setSelectedItem] = useState(null);
    
    useEffect(() => {
        if (selectedItem !== null)
            onChange(`itemId eq ${selectedItem.id}`);
    }, [selectedItem]);

    return (
    <div>
        <Label htmlFor="item">Articulo</Label>
        <div className="flex">
            <SelectItem name="item" className="payment-filter-width" value={selectedItem} onChange={setSelectedItem}/>
        </div>
    </div>
    );
} 