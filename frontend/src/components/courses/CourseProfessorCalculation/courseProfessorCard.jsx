import React from "react";
import "react-datepicker/dist/react-datepicker.css";
import PaidIcon from '@mui/icons-material/Paid';
import DownloadIcon from '@mui/icons-material/Download';
import { Link } from "react-router-dom";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Tooltip, IconButton } from '@mui/material';
import ProfessorsCollapse from "./professorsCollapse";
import coursesService from "../../../services/coursesService";
import { dateToYYYYMMDD } from "../../../utils";

export default function CourseProfessorCard({ onInformPayment, course, onShowPayments, from, to }) {

    const handleDownloadCourse = async () => {
        try {
            const parsedFrom = dateToYYYYMMDD(from.$d);
            const parsedTo = dateToYYYYMMDD(to.$d);
            
            const response = await coursesService.exportProfessorsPayments(parsedFrom, parsedTo, course.id);
            
            // Create blob and download
            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pagos_profesores_curso_${course.title}_${parsedFrom}_${parsedTo}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar curso:', error);
        }
    };

    return (
    <div className="mt-2 w-full flex flex-col border rounded p-4 shadow-md bg-white mb-4 relative">
        {/* Botón de descarga en esquina superior derecha */}
        <div className="absolute top-2 right-2 z-10">
            <Tooltip title="Descargar">
                <IconButton onClick={handleDownloadCourse} size="small" className="bg-white shadow-md">
                    <DownloadIcon />
                </IconButton>
            </Tooltip>
        </div>
        
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            >
            <ListItemButton>
                <ListItemIcon>
                    <LocalLibraryIcon/>
                </ListItemIcon>
                <Link to={`/home/courses/${course.id}`}>
                    <ListItemText primary="Curso" secondary={course.title} />
                </Link>
            </ListItemButton>
            <ListItem>
                <ListItemIcon>
                    <PaidIcon/>
                </ListItemIcon>
                <ListItemText primary="Ingresos" secondary={`${course.collectedByPayments}$`} />
            </ListItem>
            <ProfessorsCollapse onInformPayment={onInformPayment} from={from} to={to} onShowPayments={onShowPayments} professors={course.professors} courseId={course.id}/>
        </List>
    </div>
    );
} 