import React, { useContext, useEffect, useState } from 'react'
import Modal from '../modal'
import DeleteIcon from '@mui/icons-material/Delete';
import { Context } from '../../context/Context';
import ErrorIcon from '@mui/icons-material/Error';
import Table from '../table';
import { STUDENT_STATUS } from '../../constants';
import { getMonthNameByMonthNumber } from '../../utils';
import useToggle from '../../hooks/useToggle';
import { DateTimePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import CustomCheckbox from '../checkbox/customCheckbox';
import ButtonPrimary from '../button/primary';
import Select from '../select/select';

const FormattedDate = ({period}) => {
	const [year, month] = period.split("-")
	return <span className='font-medium'>{getMonthNameByMonthNumber(month)} {year}</span>
}

const DeleteButton = ({ onClick }) => <button className="ml-2 rounded-full p-0.5 bg-red-200 hover:bg-red-300 mx-1" onClick={onClick}>
<DeleteIcon style={{fontSize: "20px"}} />
</button>

const AddSuspensionForm = ({ studentId, courseId, onAddSuspension }) => {
	const { suspendStudentFromCourse } = useContext(Context)
	const [from, setFrom] = useState(dayjs(new Date()));
	const [to, setTo] = useState(dayjs(new Date()));
	const isUndefined = useToggle()

	const handleAddSuspension = async () => {
		const toString = date => {
			let month = parseInt(date.$d.getMonth())
			month++
			if (month < 10)
				month = "0" + month
			return date.$d.getFullYear() + "-" + month
		}
		const f = toString(from)
		const t = isUndefined.value ? null : toString(to)
		await suspendStudentFromCourse(studentId, courseId, f, t)
		onAddSuspension()
	}

	return <><div className='mt-4 flex'>
		<div className='w-6/12'>
			<div className='mb-1'>Ingrese el mes desde el cual el alumno estara suspendido</div>
			<div className=''>
				<DateTimePicker
					views={['year', 'month']}
					format='YYYY/MM'
					label="Seleccionar fecha"
					className='w-6/12'
					value={from}
					onChange={setFrom}
				/>
			</div>
		</div>
		<div className='ml-4 w-6/12'>
			<div className='mb-1'>Ingrese el mes desde el cual el alumno dejara de estar suspendido</div>
			<div className=''>
				<DateTimePicker
					views={['year', 'month']}
					format='YYYY/MM'
					label="Seleccionar fecha"
					className='w-6/12'
					disabled={isUndefined.value}
					value={to}
					onChange={setTo}
				/>
				<CustomCheckbox
					checked={isUndefined.value}
					labelOn="Indefinido"
					labelOff="Indefinido"
					className="ml-2"
					onChange={isUndefined.toggle}
				/>
				<p className={`mt-2 text-sm text-gray-500 dark:text-gray-400 ${!isUndefined.value && "invisible"}`}>Podra definir mas adelante la fecha en que termina la suspension</p>
			</div>
		</div>
	</div>
	<ButtonPrimary onClick={handleAddSuspension}>Agregar suspension</ButtonPrimary>
	</>
}

const SuspensionsModal = ({ students, isOpen, onClose, courseId }) => {
	const { deleteSuspension, finishSuspend } = useContext(Context)
	const [selectedStudent, setSelectedStudent] = useState(null)
	const isAddingSuspension = useToggle()
	const suspendedStudents = students.filter(st => st.status == STUDENT_STATUS.SUSPEND);
	const columns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
	]
	const handleDeleteSuspension = period => deleteSuspension(selectedStudent.id, courseId, period.suspendedAt, period.suspendedEndAt);
	
	const handleFinishSuspend = period => finishSuspend(selectedStudent.id, courseId, period.suspendedAt);

	useEffect(() => {
		if (selectedStudent != null) {
			setSelectedStudent(students.find(st => st.id === selectedStudent.id))
		}
	}, [students])
	

  return (
    <Modal footer={false} size={"large"} onClose={onClose} icon={<ErrorIcon />} open={isOpen} setDisplay={onClose} title="Suspensiones">
		<h2 className='text-xl font-medium mb-2'>Seleccione un alumno</h2>
		<Select
			className='z-50'
			placeholder="Seleccionar alumno"
			value={selectedStudent}
			onChange={setSelectedStudent}
			options={students}
			getOptionLabel={option => option.name + " " + option.lastName}
			getOptionValue={option => option.id}
		/>

		{selectedStudent != null && <>
			<div className='mt-2'>El alumno se encuentra <span className='font-medium'>{selectedStudent.status == STUDENT_STATUS.ACTIVE ? "activo" : "suspendido"}</span> actualmente.</div>
			{selectedStudent.suspendedPeriods.length > 0 ?
			<div className='mt-2'>
				<h2 className='font-medium text-xl'>Periodos de suspension de {selectedStudent.name} {selectedStudent.lastName}</h2>
				<ul>
					{selectedStudent.suspendedPeriods.map(period => <li key={period.suspendedAt}>
						• Desde: <FormattedDate period={period.suspendedAt}/> 
						{period.suspendedEndAt != null ? <> hasta <FormattedDate period={period.suspendedEndAt}/></> : <span className='ml-1 underline cursor-pointer' onClick={() => handleFinishSuspend(period)}>finalizar suspension</span>}
						<DeleteButton onClick={() => handleDeleteSuspension(period)}/>
					</li>)}
				</ul>
				{isAddingSuspension.value ? 
				<AddSuspensionForm courseId={courseId} studentId={selectedStudent.id} onAddSuspension={isAddingSuspension.disable}/>
				:
				<div className='underline cursor-pointer' onClick={isAddingSuspension.toggle}>Agregar</div>
				}
			</div>
			: isAddingSuspension.value ? 
				<AddSuspensionForm courseId={courseId} studentId={selectedStudent.id} onAddSuspension={isAddingSuspension.disable}/>
				:
				<div>No se encontraron suspensiones previas, <span onClick={isAddingSuspension.toggle} className='underline cursor-pointer'>agregar</span></div>
			}
		</>
		}

		{suspendedStudents.length > 0 && <>
			<div className='divide-y my-6'>
				<div></div>
				<div></div>
			</div>
			<h2 className='text-xl font-medium mb-4'>Alumnos actualmente suspendidos</h2>
			<Table columns={columns} data={suspendedStudents} />
		</>
		}
    </Modal>
  )
}

export default SuspensionsModal