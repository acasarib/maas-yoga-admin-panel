import React, { useEffect, useState } from "react";
import Select from "react-select";
import coursesService from "../../../services/coursesService";

export default function FilterPaymentCourse({ onChange }) {

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);

    useEffect(() => {
        const getCourses = async () => {
            const coursesList = await coursesService.getCourses();
            coursesList.forEach(course => {
                course.label = course.title;
                course.value = course.id;
            })
            setCourses(coursesList);
        }
        getCourses();
    }, []);
    
    
    useEffect(() => {
        if (selectedCourse !== null)
            onChange(`courseId eq ${selectedCourse.id}`);
    }, [selectedCourse]);
    
    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Curso</span>
        <div className="flex">
            <Select className="payment-filter-width" options={courses} value={selectedCourse} onChange={setSelectedCourse}/>
        </div>
    </div>
    );
} 