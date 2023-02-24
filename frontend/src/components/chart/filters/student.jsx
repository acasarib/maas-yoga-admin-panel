import React, { useEffect, useState } from "react";
import Select from "react-select";
import studentsService from "../../../services/studentsService";

export default function FilterPaymentStudent({ onChange }) {

    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name;
                student.value = student.id;
            })
            setStudents(studentsList);
        }
        getStudents();
    }, []);
    
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