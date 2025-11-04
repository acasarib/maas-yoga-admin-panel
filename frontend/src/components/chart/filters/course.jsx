import React, { useEffect, useState } from "react";
import SelectCourses from "../../select/selectCourses";
import CustomCheckbox from "../../checkbox/customCheckbox";
import Label from "../../label/label";

export default function FilterPaymentCourse({ onChange }) {

    const [selectedCourse, setSelectedCourse] = useState(null);
    const [allCourses, setAllCourses] = useState(false);
    
    useEffect(() => {
        if (selectedCourse !== null) {
            onChange(`courseId eq ${selectedCourse.id}`);
        }else {
            if(allCourses) onChange(`courseId ne null`);
        }
    }, [selectedCourse, allCourses]);
    
    return (
    <div>
        <Label htmlFor="course">Curso</Label>
        <div className="flex space-x-4 items-end">
            <SelectCourses
                name="course"
                className="payment-filter-width"
                value={selectedCourse}
                onChange={setSelectedCourse}
            />
            <CustomCheckbox
                checked={allCourses}
                labelOn="Todos"
                labelOff="Todos"
                className="ml-2"
                onChange={() => setAllCourses(!allCourses)}
            />
        </div>
    </div>
    );
} 