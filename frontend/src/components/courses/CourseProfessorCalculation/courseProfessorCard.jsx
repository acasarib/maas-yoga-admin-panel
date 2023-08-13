import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import PaidIcon from '@mui/icons-material/Paid';
import { Link } from "react-router-dom";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ProfessorsCollapse from "./professorsCollapse";

export default function CourseProfessorCard({ onInformPayment, course, onShowPayments, from, to }) {

    return (
    <div className="mt-2 w-full flex flex-col border rounded p-4 shadow-md bg-white mb-4">
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            >
            <ListItemButton>
                <ListItemIcon className="text-yellow-900">
                    <LocalLibraryIcon/>
                </ListItemIcon>
                <Link to={`/home/courses`}>
                    <ListItemText primary="Curso" secondary={course.title} />
                </Link>
            </ListItemButton>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <PaidIcon/>
                </ListItemIcon>
                <ListItemText primary="Ingresos" secondary={`${course.collectedByPayments}$`} />
            </ListItem>
            <ProfessorsCollapse onInformPayment={onInformPayment} from={from} to={to} onShowPayments={onShowPayments} professors={course.professors}/>
        </List>
    </div>
    );
} 