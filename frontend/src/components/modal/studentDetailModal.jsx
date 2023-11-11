import React, { useContext, useEffect, useState } from "react";
import Modal from "../modal";
import SchoolIcon from '@mui/icons-material/School';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from '@mui/material/ListItemButton';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';
import { Context } from "../../context/Context";
import List from '@mui/material/List';
import StudentCalendar from "../calendar/studentCalendar";
import { formatDateDDMMYY, toMonthsNames } from "../../utils";
import RedBudget from "../badget/red";
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

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
                <Course student={student} course={course}/>
            </List>)}
        </Modal>
    );
}

function Course({ course, student }) {
    const [isOpen, setIsOpen] = useState(false);
    const { updateInscriptionDate } = useContext(Context);
    const [editInscriptionDate, setEditInscriptionDate] = useState(false);
    const switchEditInscriptionDate = () => setEditInscriptionDate(!editInscriptionDate);
    const [inputValue, setInputValue] = useState("");
    const handleOnEditInscriptionDate = () => {
        updateInscriptionDate(student.id, course.id, inputValue.$d)
        switchEditInscriptionDate();
    }

    useEffect(() => {
        setInputValue(dayjs(course.memberSince));
    }, [course]);
    

    return (<>
    <ListItemButton onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon className="text-yellow-900">
            <LocalLibraryIcon/>
        </ListItemIcon>
        <ListItemText primary={<>{course.title} {course.isUpToDate === false && <RedBudget className="ml-2">Pago pendiente</RedBudget>}</>} secondary={toMonthsNames(course.startAt, course.endAt)} />
    </ListItemButton>
    <Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
        <div className={`my-2 flex ${editInscriptionDate && "flex-column"}`}>Fecha de inscripción: 
            {editInscriptionDate ? (
                <div className="flex mt-4 flex items-center">
                    <DatePicker
                        label="Seleccionar fecha"
                        value={inputValue}
                        onChange={setInputValue}
                    />
                    <span>
                        <CheckIcon onClick={handleOnEditInscriptionDate} className="mx-2 cursor-pointer"/>
                        <CloseIcon onClick={switchEditInscriptionDate} className="cursor-pointer"/>
                    </span>
                </div> 
                )
            : <><span className="ml-1">{formatDateDDMMYY(course.memberSince)}</span>
                <span onClick={switchEditInscriptionDate} className="ml-2 cursor-pointer flex items-center">
                    <EditIcon fontSize="small"/>
                </span>
            </>}
        </div>
        <StudentCalendar periods={course.periods}/>
    </Collapse>
    </>);
}