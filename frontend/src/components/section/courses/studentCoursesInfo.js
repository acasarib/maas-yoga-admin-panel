import React, { useState } from 'react'
import Modal from '../../modal'
import StudentCalendar from '../../calendar/studentCalendar'
import DangerousIcon from '@mui/icons-material/Dangerous';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import { STUDENT_MONTHS_CONDITIONS } from '../../../constants';
import ErrorIcon from '@mui/icons-material/Error';
import PaidIcon from '@mui/icons-material/Paid';

const StudentCoursesInfo = ({ student, onSeePayments }) => {

	return (<>
		<div className='flex'>
			<div className='underline text-yellow-900 mx-1 cursor-pointer' onClick={() => onSeePayments(student)}>Ver pagos</div>
			{student.currentMonth == STUDENT_MONTHS_CONDITIONS.NOT_PAID && <Tooltip title="Mes actual impago"><DangerousIcon style={{ color: '#FF676D' }}/></Tooltip>}
			{student.currentMonth == STUDENT_MONTHS_CONDITIONS.PAID && <Tooltip title="Al dia"><CheckIcon style={{ color: '#72EA8D' }}/></Tooltip>}
			{student.currentMonth == STUDENT_MONTHS_CONDITIONS.SUSPEND && <Tooltip title="Suspendido"><ErrorIcon style={{ color: '#FFCD30' }}/></Tooltip>}
		</div>
		</>)
}

export default StudentCoursesInfo