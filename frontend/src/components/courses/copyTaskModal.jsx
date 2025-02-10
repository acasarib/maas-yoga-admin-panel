import React, { useEffect, useState } from "react";
import Modal from "../modal";
import AddTaskIcon from '@mui/icons-material/AddTask';
import coursesService from "../../services/coursesService";
import Select from "../select/select";

export default function CopyTaskModal(props) {
    const [selectedCourse, setSelectedCourse] = useState(null)
    const [inputText, setInputText] = useState("")
    const [courses, setCourses] = useState([])

    const fetchCourses = async () => {
        const data = await coursesService.getCoursesByTitle(inputText);
        setCourses(data.courses)
    }

    useEffect(() => {
        fetchCourses()
    }, [inputText])
    

    const handleCopy = async () => {
        console.log(selectedCourse);
        await coursesService.copyTasks(selectedCourse.id, props.courseId)
        window.location.reload();
    }

    return(
        <>          
                <Modal buttonDisabled={selectedCourse == null} icon={<AddTaskIcon />} open={props.isModalOpen} setDisplay={props.setDisplay} buttonText={"Copiar"} onClick={handleCopy} title={`Copiar tareas al curso ${'"' + props.courseName + '"'}`} children={<>
                <p>Seleccione el curso que desea copiar las tareas. Una vez confirmado las tareas del curso seleccionado se copiaran a este curso.</p>
                <div className="mt-4">
                    <Select
                        onChange={setSelectedCourse}
                        onInputChange={(newText) => setInputText(newText)}
                        options={courses}
                        value={selectedCourse}
                        getOptionLabel ={(course)=> course.title}
                        getOptionValue ={(course)=> course.id}
                    />
                </div>
                </>} />
        </>
    );
} 