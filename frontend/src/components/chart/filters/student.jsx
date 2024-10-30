import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";

export default function FilterPaymentStudent({ onChange }) {

    const { students } = useContext(Context);
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    useEffect(() => {
        if (selectedStudent !== null)
            onChange(`studentId eq ${selectedStudent.id}`);
    }, [selectedStudent]);
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Estudiante</span>
        <div className="flex">
            <Select className="payment-filter-width" options={students} value={selectedStudent} onChange={setSelectedStudent}/>
        </div>
    </div>
    );
} 