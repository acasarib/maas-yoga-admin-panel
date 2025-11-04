import React, { useEffect, useState } from "react";
import SelectColleges from "../../select/selectColleges";
import Label from "../../label/label";

export default function FilterPaymentCollege({ onChange }) {
    const [selectedCollege, setSelectedCollege] = useState(null);
    
    useEffect(() => {
        if (selectedCollege !== null)
            onChange(`headquarterId eq ${selectedCollege.id}`);
    }, [selectedCollege]);
    
    return (
    <div>
        <Label htmlFor="headquarter">Sede</Label>
        <div className="flex">
            <SelectColleges
                name="headquarter"
                className="payment-filter-width"
                value={selectedCollege}
                onChange={setSelectedCollege}
            />
        </div>
    </div>
    );
} 