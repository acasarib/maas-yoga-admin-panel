import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PaidIcon from '@mui/icons-material/Paid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ListItemText from '@mui/material/ListItemText';
import ProfessorDetailCollapse from "./professorDetailCollapse";
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';

export default function ProfessorsCollapse({ professors, onShowPayments,from, to, onInformPayment }) {
    const [isOpen, setIsOpen] = useState(false);

    return (<>
    <ListItemButton onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon className="text-yellow-900">
            <RecordVoiceOverIcon/>{/*TODO: cambiar por icono de profes*/}
        </ListItemIcon>
        <ListItemText primary="Profesores" />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
    <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" >
            {professors.map((professor, i) => <ProfessorDetailCollapse onInformPayment={onInformPayment} from={from} to={to} onShowPayments={onShowPayments} key={i} professor={professor}/>)}
        </List>
    </Collapse>
    </>);
} 