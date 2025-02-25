import React, { useEffect, useState } from "react";
import SelectItem from "../../select/selectItem";

export default function FilterPaymentItem({ onChange }) {

    const [selectedItem, setSelectedItem] = useState(null);
    
    useEffect(() => {
        if (selectedItem !== null)
            onChange(`itemId eq ${selectedItem.id}`);
    }, [selectedItem]);

    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Articulo</span>
        <div className="flex">
            <SelectItem className="payment-filter-width" value={selectedItem} onChange={setSelectedItem}/>
        </div>
    </div>
    );
} 