import React, { useEffect, useState } from "react";
import SelectStudent from "../../select/selectStudent";
import Label from "../../label/label";

export default function FilterPaymentStudent({ onChange }) {
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    useEffect(() => {
        if (selectedStudent !== null)
            onChange(`studentId eq ${selectedStudent.id}`);
    }, [selectedStudent]);
    
    return (
    <div>
        <Label htmlFor="studentId">Estudiante</Label>
        <div className="flex">
            <SelectStudent
                name="studentId"
                className="payment-filter-width"
                value={selectedStudent}
                onChange={setSelectedStudent}
            />
        </div>
    </div>
    );
} 