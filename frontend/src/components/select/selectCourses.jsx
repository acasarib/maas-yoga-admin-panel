import React, { useEffect, useState } from "react";
import CustomAutoSuggest from "./customAutoSuggest";
import coursesService from "../../services/coursesService";
import Select from "./select";

export default function SelectCourses({ options, defaultValue, onChange, value, className }) {
  const [courses, setCourses] = useState([]);
  const [courseTitle, setCourseTitle] = useState('');

  const fetchCourses = async () => {
    const response = await coursesService.getCourses(1, 10, null);
    setCourses(response.data);
  }

  useEffect(() => {
    if (value?.title)
      setCourseTitle(value.title)
  }, [value])
  
  useEffect(() => {
    fetchCourses();
  }, [])

  const onSuggestionsFetchRequested = async ({ value }) => {
    const response = await coursesService.getCourses(1, 10, value);       
    setCourses(response.data)
  }

  const onSuggestionsClearRequested = () => {        
    setCourses([])
  }

  return options == null ? 
    <CustomAutoSuggest
      className={className}
      suggestions={courses}
      getSuggestionValue={(course) => course.title}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      placeholder={'Curso'}
      value={courseTitle}
      onChange={setCourseTitle}
      onSuggestionSelected={onChange}
    />
  : 
    <Select
      options={options}
      onChange={onChange}
      value={value}
      defaultValue={defaultValue}
      getOptionLabel ={(course)=> course.title}
      getOptionValue ={(course)=> course.id}
    />
} 