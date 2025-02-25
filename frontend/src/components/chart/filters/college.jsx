import React, { useEffect, useState } from "react";
import SelectColleges from "../../select/selectColleges";

export default function FilterPaymentCollege({ onChange }) {
    const [selectedCollege, setSelectedCollege] = useState(null);
    
    useEffect(() => {
        if (selectedCollege !== null)
            onChange(`headquarterId eq ${selectedCollege.id}`);
    }, [selectedCollege]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Sede</span>
        <div className="flex">
            <SelectColleges
                className="payment-filter-width"
                value={selectedCollege}
                onChange={setSelectedCollege}
            />
        </div>
    </div>
    );
} 