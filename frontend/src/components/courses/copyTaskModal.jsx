import React, { useEffect, useState } from "react";
import Modal from "../modal";
import AddTaskIcon from '@mui/icons-material/AddTask';
import coursesService from "../../services/coursesService";
import SelectCourses from "../select/selectCourses";
import Label from "../label/label";

export default function CopyTaskModal(props) {
    const [selectedCourse, setSelectedCourse] = useState(null)    

    const handleCopy = async () => {
        await coursesService.copyTasks(selectedCourse.id, props.courseId)
        window.location.reload();
    }

    return(
        <>          
                <Modal buttonDisabled={selectedCourse == null} icon={<AddTaskIcon />} open={props.isModalOpen} setDisplay={props.setDisplay} buttonText={"Copiar"} onClick={handleCopy} title={`Copiar tareas al curso ${'"' + props.courseName + '"'}`} children={<>
                    <p>Seleccione el curso que desea copiar las tareas. Una vez confirmado las tareas del curso seleccionado se copiaran a este curso.</p>
                    <div className="mt-4">
                        <Label htmlFor="course">Curso</Label>
                        <SelectCourses
                            name="course"
                            onChange={setSelectedCourse}
                            value={selectedCourse}
                        />
                    </div>
                </>} />
        </>
    );
} 