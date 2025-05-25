import React from 'react'
import DangerousIcon from '@mui/icons-material/Dangerous';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import { STUDENT_MONTHS_CONDITIONS } from '../../../constants';
import ErrorIcon from '@mui/icons-material/Error';
import { formatPaymentValue } from '../../../utils';
import { Link } from 'react-router-dom';

const StudentCoursesInfo = ({ student, onSeePayments }) => {
	function checkNotPaidCondition() {
		if ('circular' in student.pendingPayments) {
			return student.pendingPayments.circular
		}
		const data = student.pendingPayments
		const currentYear = new Date().getFullYear();
		const currentMonth = new Date().getMonth() + 1;
	
		for (const year in data) {
			if (data.hasOwnProperty(year)) {
				const months = data[year];
				const yearInt = parseInt(year, 10);
	
				for (const month in months) {
					if (months.hasOwnProperty(month)) {
						const details = months[month];
						const monthInt = parseInt(month, 10);
	
						if (details.condition === "NOT_PAID") {
							if (
								(yearInt < currentYear) ||
								(yearInt === currentYear && monthInt <= currentMonth)
							) {
								return true;
							}
						}
					}
				}
			}
		}
		return false;
	}	
	
	const hasAnyPendingPayment = checkNotPaidCondition();

	const pendingPayment = <><Tooltip title="Pago pendiente"><DangerousIcon style={{ color: '#FF676D' }}/></Tooltip></>
	const upToDate = <><Tooltip title="Al dia"><CheckIcon style={{ color: '#72EA8D' }}/></Tooltip></>

	return (<>
		<div className='flex items-center' style={{minWidth: '100px'}}>
			{"circular" in student.pendingPayments ? <>
				{hasAnyPendingPayment ? pendingPayment : <>{upToDate}<Tooltip title={`${formatPaymentValue(student.circularPayment.value)}`} className='underline text-yellow-900 mx-1 cursor-pointer'><Link target='_blank' to={`/home/payments?id=${student.circularPayment.id}`}>Ver pago</Link></Tooltip></>}
			</> : <>
			<div className='underline text-yellow-900 mx-1 cursor-pointer' onClick={() => onSeePayments(student)}>Ver pagos</div>
			{(hasAnyPendingPayment || student.currentMonth == STUDENT_MONTHS_CONDITIONS.NOT_PAID) && pendingPayment}
			{(!hasAnyPendingPayment && (student.currentMonth == STUDENT_MONTHS_CONDITIONS.PAID || student.currentMonth == STUDENT_MONTHS_CONDITIONS.NOT_TAKEN)) && upToDate}
			{(!hasAnyPendingPayment && student.currentMonth == STUDENT_MONTHS_CONDITIONS.SUSPEND) && <Tooltip title="Suspendido"><ErrorIcon style={{ color: '#FFCD30' }}/></Tooltip>}
			</>}
		</div>
		</>)
}

export default StudentCoursesInfo