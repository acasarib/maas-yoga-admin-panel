import React, { useState } from 'react'
import ProfessorModule from './professorModule'
import { Collapse, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ProfessorCalendar from '../../calendar/professorCalendar';

function Course({ course, payments, professor, onAddPayment }) {
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
		<ProfessorCalendar onAddPayment={onAddPayment} professor={professor} courseId={course.id} enabledPeriods={course.professorCourse} payments={payments}/>
	</Collapse>
	</>);
}

const ProfessorCourses = ({ onCancel, professor, onAddPayment }) => {
  return (
		<ProfessorModule title="Cursos" onCancel={onCancel}>
			{professor?.courses?.map(course => <Course onAddPayment={onAddPayment} key={course.id} professor={professor} course={course} payments={professor.payments}/>)}

    </ProfessorModule>

  )
}

export default ProfessorCourses