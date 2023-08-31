import React, { useContext, useEffect, useState } from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import ProfessorCalendar from "../calendar/professorCalendar";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItemIcon from '@mui/material/ListItemIcon';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ListItemButton from '@mui/material/ListItemButton';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Collapse from '@mui/material/Collapse';
import { Context } from "../../context/Context";
import ListItemText from '@mui/material/ListItemText';

export default function ProfessorDetailModal({ isOpen, onClose, professorId }) {

    const { professors, getProfessorDetailsById } = useContext(Context);
    const [professor, setProfessor] = useState(null);

    const updateProfessor = async () => {
        setProfessor(await getProfessorDetailsById(professorId));
    }

    useEffect(() => {
        if (professorId === null) {
            setProfessor(null);
        } else {
            updateProfessor();
        }
    }, [professorId, professors])
    
    
    return(
        <Modal hiddingButton open={isOpen} icon={<HailIcon/>} setDisplay={() => onClose()} title={professor?.name}>
            <h2 className="text-xl ml-2 mb-2">Cursos</h2>
            {professor?.courses?.map(course => <Course key={course.id} professorId={professor.id    } course={course} payments={professor.payments}/>)}
        </Modal>
    );
}

function Course({ course, payments, professorId }) {
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
        <ProfessorCalendar professorId={professorId} courseId={course.id} enabledPeriods={course.professorCourse} payments={payments}/>
    </Collapse>
    </>);
}