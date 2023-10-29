import React, { useContext, useEffect, useState } from "react";
import Modal from "../modal";
import SchoolIcon from '@mui/icons-material/School';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import { Context } from "../../context/Context";
import List from '@mui/material/List';
import StudentCalendar from "../calendar/studentCalendar";
import { formatDateDDMMYY, toMonthsNames } from "../../utils";
import RedBudget from "../badget/red";

export default function StudentDetailModal({ isOpen, onClose, student }) {
    const { getPendingPaymentsByCourseFromStudent } = useContext(Context);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        if (student && "payments" in student) {
            setCourses(getPendingPaymentsByCourseFromStudent(student));
        }
    }, [student]);
    

    return(
        <Modal hiddingButton open={isOpen} icon={<SchoolIcon/>} setDisplay={() => onClose()} title={student?.name}>
            <h2 className="text-xl mt-4 mb-2">Cursos</h2>
            {courses.map((course, i) => <List key={i} component="div" disablePadding>
                <Course course={course}/>
            </List>)}
        </Modal>
    );
}

function Course({ course }) {
    const [isOpen, setIsOpen] = useState(false);

    return (<>
    <ListItemButton onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon className="text-yellow-900">
            <LocalLibraryIcon/>
        </ListItemIcon>
        <ListItemText primary={<>{course.title} {course.isUpToDate === false && <RedBudget className="ml-2">Pago pendiente</RedBudget>}</>} secondary={toMonthsNames(course.startAt, course.endAt)} />
    </ListItemButton>
    <Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
        <div className="my-2">Fecha de inscripción: {formatDateDDMMYY(course.memberSince)}</div>
        <StudentCalendar periods={course.periods}/>
    </Collapse>
    </>);
}