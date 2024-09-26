import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";

export default function FilterPaymentCourse({ onChange }) {

    const { courses } = useContext(Context);
    const [selectedCourse, setSelectedCourse] = useState(null);
    
    useEffect(() => {
        if (selectedCourse !== null)
            onChange(`courseId eq ${selectedCourse.id}`);
    }, [selectedCourse]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Curso</span>
        <div className="flex">
            <Select
                className="payment-filter-width"
                options={courses}
                value={selectedCourse}
                onChange={setSelectedCourse}
                getOptionLabel ={(course)=> course.title}
                getOptionValue ={(course)=> course.id}
            />
        </div>
    </div>
    );
} 