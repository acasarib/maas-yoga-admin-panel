import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PaidIcon from '@mui/icons-material/Paid';
import { formatDateDDMMYY } from "../../../utils";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import List from '@mui/material/List';
import SchoolIcon from '@mui/icons-material/School';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PercentIcon from '@mui/icons-material/Percent';
import ListItemText from '@mui/material/ListItemText';
import ButtonPrimary from "../../button/primary";

export default function ProfessorDetailCollapse({ professor }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (<>
    <ListItemButton sx={{ pl: 4 }} onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon>
            <RecordVoiceOverIcon />{/*TODO: cambiar por icono de profes*/}
        </ListItemIcon>
        <ListItemText primary={`${professor.name} ${professor.lastName}`} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
    <Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
            <ListItemButton onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                <ListItemIcon className="text-yellow-900">
                    <CalendarMonthIcon/>
                </ListItemIcon>
                <ListItemText primary="Periodo" secondary={`${formatDateDDMMYY(new Date(professor.result.period.startAt))} - ${formatDateDDMMYY(new Date(professor.result.period.endAt))}`} />
            </ListItemButton>
            <Collapse className="ml-10" in={isCalendarOpen} timeout="auto" unmountOnExit>
                <ul>
                    {professor.periods.map(period => 
                        <li>
                            <span className={period.id === professor.result.period.id && "font-bold"}>- {formatDateDDMMYY(new Date(period.startAt))} - {formatDateDDMMYY(new Date(period.endAt))} </span><span>{period.id === professor.result.period.id && "(periodo seleccionado)"}</span>
                        </li>
                    )}
                </ul>
            </Collapse>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <SchoolIcon/>
                </ListItemIcon>
                <ListItemText primary="Estudiantes que abonaron" secondary={professor.result.totalStudents} />
            </ListItem>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <PaidIcon/>
                </ListItemIcon>
                <ListItemText primary="Total a pagar al profesor" secondary={`${professor.result.collectedByProfessor}$`} />
            </ListItem>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <PercentIcon/>
                </ListItemIcon>
                <ListItemText primary="Criterio" secondary={professor.result.period.criteria === "percentage" ? `Se debe pagar el ${professor.result.period.criteriaValue}% del total de ingresos` : `Se debe pagar ${professor.result.period.criteriaValue}$ por cada estudiante`} />
            </ListItem>
            <div className="mt-2 md:mt-4 md:flex md:flex-row justify-center gap-12">
                <ButtonPrimary /*onClick={() => addPayment(d)}*/>Informar</ButtonPrimary>
                <ButtonPrimary /*onClick={() => setActiveCourseModal(d)}*/>Ver pagos</ButtonPrimary>
            </div>
        </List>
    </Collapse>
    </>);
} 