import React, { useEffect, useState } from "react";
import SelectCourses from "../../select/selectCourses";

export default function FilterPaymentCourse({ onChange }) {

    const [selectedCourse, setSelectedCourse] = useState(null);
    
    useEffect(() => {
        if (selectedCourse !== null)
            onChange(`courseId eq ${selectedCourse.id}`);
    }, [selectedCourse]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Curso</span>
        <div className="flex">
            <SelectCourses
                className="payment-filter-width"
                value={selectedCourse}
                onChange={setSelectedCourse}
            />
        </div>
    </div>
    );
} 