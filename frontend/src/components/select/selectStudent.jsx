import React, { useEffect, useState } from "react";
import studentsService from "../../services/studentsService";
import CustomAutoSuggest from "./customAutoSuggest";
import Select from "./select";

export default function SelectStudent({ onChange, options, value, className }) {
  
  const [students, setStudents] = useState([]);
  const [studentFullName, setStudentFullName] = useState('');

  const fetchStudents = async () => {
    const response = await studentsService.getStudents(1, 10, null);
    setStudents(response.data);
  }
  
  useEffect(() => {
    fetchStudents();
  }, [])

  const onSuggestionsFetchRequested = async ({ value }) => {
    const params = {
      isOrOperation: true,
      name: { operation: 'iLike', value },
      lastName: { operation: 'iLike', value },
      email: { operation: 'iLike', value },
    }
    const response = await studentsService.getStudents(1, 10, params)        
    setStudents(response.data)
  }

  useEffect(() => {
    if (value)
      setStudentFullName(value.name + " " + value.lastName)
  }, [value])
  

  const onSuggestionsClearRequested = () => {        
    setStudents([])
  }

  return options == null ? 
    <CustomAutoSuggest
      className={className}
      suggestions={students}
      getSuggestionValue={(student) => student.name + ' ' + student.lastName}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      placeholder={'Estudiante'}
      value={studentFullName}
      onChange={setStudentFullName}
      onSuggestionSelected={onChange}
    />
  : 
  <Select
    onChange={onChange}
    options={options}
    value={value}
    getOptionLabel ={(student)=> `${student?.name} ${student?.lastName}`}
    getOptionValue ={(student)=> student.id}
  />

} 