import React, { useState } from 'react'
import Modal from '../../modal'
import StudentCalendar from '../../calendar/studentCalendar'
import DangerousIcon from '@mui/icons-material/Dangerous';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';

const StudentCoursesInfo = ({ student }) => {

	const [isOpen, setIsOpen] = useState(false)

	return (<>
		<Modal
		hiddingButton
		open={isOpen}
		size="large"
		setDisplay={() => setIsOpen(false)}
		buttonText={"Aplicar"}
		title={`Pagos de ${student.name} ${student.lastName} sobre el curso`}
		>
			<StudentCalendar periods={student.pendingPayments}/>
		</Modal>
		<div className='flex'>
			<div className='underline text-yellow-900 mx-1 cursor-pointer' onClick={() => setIsOpen(true)}>Ver pagos</div>
			{student.currentMonth == 'NOT_PAID' && <Tooltip title="Mes actual impago"><DangerousIcon style={{ color: '#FF676D' }}/></Tooltip>}
			{student.currentMonth == 'PAID' && <Tooltip title="Al dia"><CheckIcon style={{ color: '#72EA8D' }}/></Tooltip>}
		</div>
		</>)
}

export default StudentCoursesInfo