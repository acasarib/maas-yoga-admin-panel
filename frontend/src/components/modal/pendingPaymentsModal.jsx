import React, { useState, useContext, useEffect } from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import { Context } from "../../context/Context";
import "react-datepicker/dist/react-datepicker.css";
import { Link } from "react-router-dom";
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import StudentCalendar from "../calendar/studentCalendar";
import { formatDateDDMMYY, toMonthsNames } from "../../utils";
import useToggle from "../../hooks/useToggle";
import Loader from "../spinner/loader";
import NoDataComponent from "../table/noDataComponent";

export default function PendingPaymentsModal({ isOpen, onClose }) {
    const { getPendingPayments } = useContext(Context);
    const [data, setData] = useState(null);
    const isLoading = useToggle()


    const fetchData = async () => {
        isLoading.enable()
        const data = await getPendingPayments()
        isLoading.disable()
        setData(data);
    }

    const getDebtorStudents = () => {
        const students = Object.keys(data.students).map(studentId => data.students[studentId]);
        if (students.length === 0)
            return <NoDataComponent Icon={SchoolIcon} title="No hay alumnos" subtitle='No se encontraron alumnos que adeuden'/>
        students.sort((a, b) => {
            if (a.lastName < b.lastName) {
              return -1;
            }
            if (a.lastName > b.lastName) {
              return 1;
            }
            return 0;
        });        
        return students.map((student, i) => <StudentCard key={i} student={student}/>)
    }

    useEffect(() => {
      if (isOpen && data == null)
        fetchData();
    }, [isOpen]);


    return(
        <Modal size="large" hiddenFooter open={isOpen} setDisplay={onClose} icon={<HailIcon/>} title={"Alumnos deudores"}>
            {isLoading.value 
            ? 
                <div className="py-8 flex justify-center items-center">
                    <Loader size={16}/>
                </div>
            :
                <div className="flex flex-col gap-4">
                    {data != null && getDebtorStudents()}
                </div>
            }
        </Modal>
    );
}

const StudentCard = ({ student }) => {
    return (
    <div className="flex flex-col border rounded p-4 shadow-md bg-white">
        <List
            sx={{ width: '100%', bgcolor: 'background.paper' }}
            component="nav"
            aria-labelledby="nested-list-subheader"
            >
            <ListItemButton>
                <ListItemIcon>
                    <SchoolIcon/>
                </ListItemIcon>
                <Link to={`/home/students`}>
                    <ListItemText primary="Alumno" secondary={student.name + " " + student.lastName} />
                </Link>
            </ListItemButton>
            <StudentCollapse courses={student.courses}/>
        </List>
    </div>
    );
}

const StudentCollapse = ({ courses }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (<>
        <ListItemButton onClick={() => setIsOpen(!isOpen)}>
            <ListItemIcon>
                <LocalLibraryIcon/>
            </ListItemIcon>
            <ListItemText primary="Cursos impagos" />
            {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" >
                {courses.map((course, i) => <ProfessorDetailCollapse key={i} course={course}/>)}
            </List>
        </Collapse>
    </>);
}

const ProfessorDetailCollapse = ({ course }) => {
    const isOpen = useToggle();
    const onClickExpand = () => {
        if (!course.isCircular)
            isOpen.toggle()
    }
    
    return (<>
        <ListItemButton sx={{ pl: 4 }} onClick={onClickExpand}>
            <ListItemText primary={`${course.title}`} secondary={<span className="flex flex-col"><span className={course.isCircular && 'text-red-400'}>{course.isCircular ? "Curso circular no pagado" : "Duración del curso: " + toMonthsNames(course.startAt, course.endAt)}</span>Alumno inscripto en: {formatDateDDMMYY(course.memberSince)}</span>} />
            {!course.isCircular && <>
            {isOpen.value ? <ExpandLess /> : <ExpandMore />}
            </>}
        </ListItemButton>
        <Collapse className="ml-10" in={isOpen.value} timeout="auto" unmountOnExit>
            <StudentCalendar periods={course.periods}/>
        </Collapse>
    </>);
}
