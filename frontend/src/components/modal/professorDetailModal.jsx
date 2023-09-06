import React, { useState } from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import ProfessorCalendar from "../calendar/professorCalendar";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import ListItemText from '@mui/material/ListItemText';

export default function ProfessorDetailModal({ isOpen, onClose, professor }) {


    return(
        <Modal hiddingButton open={isOpen} icon={<HailIcon/>} setDisplay={() => onClose()} title={professor?.name}>
            <h2 className="text-xl ml-2 mb-2">Cursos</h2>
            {professor?.courses?.map(course => <Course key={course.id} professor={professor} course={course} payments={professor.payments}/>)}
        </Modal>
    );
}

function Course({ course, payments, professor }) {
    const [isOpen, setIsOpen] = useState(false);

    return (<>
    <ListItemButton onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon className="text-yellow-900">
            <LocalLibraryIcon/>
        </ListItemIcon>
        <ListItemText primary={course.title} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <ProfessorCalendar professor={professor} courseId={course.id} enabledPeriods={course.professorCourse} payments={payments}/>
    </Collapse>
    </>);
}