import React, { useEffect, useState } from "react";
import SelectStudent from "../../select/selectStudent";

export default function FilterPaymentStudent({ onChange }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    useEffect(() => {
        if (selectedStudent !== null)
            onChange(`studentId eq ${selectedStudent.id}`);
    }, [selectedStudent]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Estudiante</span>
        <div className="flex">
            <SelectStudent
                className="payment-filter-width"
                value={selectedStudent}
                onChange={setSelectedStudent}
            />
        </div>
    </div>
    );
} 