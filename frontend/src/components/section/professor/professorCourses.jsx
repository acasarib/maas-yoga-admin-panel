import React, { useState } from 'react'
import ProfessorModule from './professorModule'
import { Collapse, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import ProfessorCalendar from '../../calendar/professorCalendar';

function Course({ course, payments, professor, onClickAddProfessorPayment }) {
	const [isOpen, setIsOpen] = useState(false);

	return (<>
	<ListItemButton onClick={() => setIsOpen(!isOpen)}>
			<ListItemIcon>
					<LocalLibraryIcon/>
			</ListItemIcon>
			<ListItemText primary={course.title} />
			{isOpen ? <ExpandLess /> : <ExpandMore />}
	</ListItemButton>
	<Collapse in={isOpen} timeout="auto" unmountOnExit>
		<ProfessorCalendar onClickAddProfessorPayment={onClickAddProfessorPayment} professor={professor} courseId={course.id} enabledPeriods={course.professorCourse} payments={payments}/>
	</Collapse>
	</>);
}

const ProfessorCourses = ({ onCancel, professor, onClickAddProfessorPayment }) => {
  return (
	<ProfessorModule title="Cursos" onCancel={onCancel}>
		{professor?.courses?.map(course => <Course onClickAddProfessorPayment={onClickAddProfessorPayment} key={course.id} professor={professor} course={course} payments={professor.payments}/>)}
		{professor?.courses?.length == 0 && <h1 className='text-xl md:text-2xl text-center'>No hay cursos</h1>}

    </ProfessorModule>

  )
}

export default ProfessorCourses