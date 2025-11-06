import React, { useContext, useEffect, useState } from 'react'
import Modal from '../modal'
import { useFormik } from 'formik';
import CommonInput from '../commonInput';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import DateTimeInput from '../calendar/dateTimeInput';
import useToggle from '../../hooks/useToggle';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from '../../context/Context';
import CustomCheckbox from '../checkbox/customCheckbox';
import PlusButton from '../button/plus';
import ProfessorInfo from '../courses/professorInfo';
import SelectStudent from '../select/selectStudent';
import EditButton from '../button/editButton';
import Label from '../label/label';
import { COLORS } from '../../constants';


const CreateUpdateCourseModal = ({ onClose, isOpen, courseToEdit, onFinish }) => {
	const { editCourse, addStudent, newCourse, changeAlertStatusAndMessage } = useContext(Context);
	const needsRegistration = useToggle(false);
	const isCircular = useToggle();
	const [startAt, setStartAt] = useState(dayjs(new Date()));
	const [endAt, setEndAt] = useState(dayjs(new Date()));
	const [courseProfessors, setCourseProfessors] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [periodToEdit, setPeriodToEdit] = useState({});
	const [selectedStudents, setSelectedStudents] = useState([]);
	const [newProfessor, setNewProfessor] = useState(false);
	const edit = courseToEdit != null

	useEffect(() => {
		if (courseToEdit != null) {
			setStartAt(dayjs(new Date(courseToEdit.startAt)));
			setEndAt(dayjs(new Date(courseToEdit.endAt)));
			isCircular.setValue(courseToEdit.isCircular)
			needsRegistration.setValue(courseToEdit.needsRegistration)
			let periods = [];
			courseToEdit?.periods?.forEach(period => {
				periods.push(period);
			})
			setCourseProfessors(periods);
			setSelectedStudents(courseToEdit?.students?.map(st => st.id))
		} else {
			setStartAt(dayjs(new Date()));
			setEndAt(dayjs(new Date()));
			setCourseProfessors([]);
			isCircular.disable();
			needsRegistration.disable()
			setSelectedStudents([])
		}
	}, [courseToEdit])
	

	const formik = useFormik({
		enableReinitialize: true,
		initialValues: {
			title: edit ? courseToEdit.title : '',
			description: edit ? courseToEdit.description : '',
			professors: edit ? courseToEdit.periods : [],
		},
		onSubmit: async (values, { resetForm }) => {
			const body = {
				title: values.title,
				description: values.description,
				needsRegistration: needsRegistration.value,
				isCircular: isCircular.value,
				startAt: startAt,
				endAt: isCircular.value ? null : endAt,
				professors: courseProfessors,
			};
			setIsLoading(true);
			try {
				if (edit) {
					await editCourse(courseToEdit.id, body);
					if (selectedStudents.length > 0) {
						await addStudent(courseToEdit.id, selectedStudents);
					}
				} else {
					const response = await newCourse(body);
					if (selectedStudents.length > 0) {
						await addStudent(response.id, selectedStudents);
					}
				}
				setIsLoading(false);
				resetForm();
				onFinish()
			} catch (error) {
				changeAlertStatusAndMessage(true, 'error', 'El curso no pudo ser informado... Por favor inténtelo nuevamente.')
				setIsLoading(false);
				resetForm();
				onClose();
			}
		},
	});

	const removeCourseProfessor = professor => setCourseProfessors(courseProfessors.filter(p => p.id !== professor.id));

	const handleChangeStudents = (selectedOpt) => {
			let arr = [];
			selectedOpt.forEach(opt => {
					arr.push(opt.id);
			})
			setSelectedStudents(arr)
	};

	const editPeriod = (period, id) => {
        courseProfessors.forEach((p, index) => {
            if (p.id && (p.id === id)) {
                let prfs = courseProfessors;
                prfs[index] = period;
                setCourseProfessors(prfs);
            }
        })
        setPeriodToEdit({});
        setNewProfessor(false);
    }
	
	return (
		<Modal
			icon={<LocalLibraryIcon />}
			onClick={formik.handleSubmit}
			open={isOpen}
			setDisplay={onClose}
			title={edit ? 'Editar curso' : 'Agregar curso'}
			buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>}
		>
			<form className="flex flex-col sm:grid sm:grid-cols-2 gap-6"
				method="POST"
				id="form"
				onSubmit={formik.handleSubmit}
			>
				<div className='relative sm:col-span-2'>
					<DateTimeInput
						className="w-full sm:w-auto"
						name="startAt"
						label="Fecha de inicio"
						value={startAt}
						onChange={setStartAt}
					/>
				</div>
				<div className={`relative sm:col-span-2 ${isCircular.value && "hidden"}`}>
					<DateTimeInput
						className="w-full sm:w-auto"
						name="endAt"
						label="Fecha de finalizacion"
						value={endAt}
						onChange={setEndAt}
					/>
				</div>
				<CustomCheckbox
					checked={needsRegistration.value}
					labelOn="Posee matrícula"
					labelOff="Posee matrícula"
					onChange={needsRegistration.toggle}
				/>
				<CustomCheckbox
					checked={isCircular.value}
					labelOn="Es circular"
					labelOff="Es circular"
					onChange={isCircular.toggle}
				/>
				<div className="flex flex-col sm:grid sm:grid-cols-2 sm:col-span-2 gap-6">
					<CommonInput
						label="Título"
						onBlur={formik.handleBlur}
						value={formik.values.title}
						name="title"
						htmlFor="title"
						id="title"
						type="text"
						placeholder="Título"
						onChange={formik.handleChange}
					/>
					<CommonInput
						label="Descripción"
						onBlur={formik.handleBlur}
						value={formik.values.description}
						name="description"
						htmlFor="description"
						id="description"
						type="text"
						placeholder="Descripción"
						onChange={formik.handleChange}
					/>
				</div>
				<div className='sm:col-span-2'>
					<Label htmlFor='assignStudents'>Asignar alumnos</Label>
					<SelectStudent
						name="assignStudents"
						className="z-100"
						isMulti
						onChange={handleChangeStudents}
						defaultValue={(edit && (courseToEdit.students)) ? courseToEdit.students : []}
					/>
				</div>
				{courseProfessors.length > 0 && (<div className='col-span-2'>
						<Label>Profesores</Label>
						<div className='flex flex-col gap-2'>
							{courseProfessors.map((prf, index) =>
								<div key={index} style={{ backgroundColor: COLORS.primary[50] }} className="px-3 py-2 flex justify-between items-center rounded-sm w-auto">
									<div>{prf.professor?.name} {prf.professor?.lastName}</div>
									<div>{edit && <EditButton onClick={() => { setPeriodToEdit(prf); setNewProfessor(true) }}/>} 
										<button
											type="button"
											className="rounded-full p-1 bg-gray-100 hover:bg-gray-200 hover:shadow-md mx-1 transition-all duration-200 ease-in-out transform ml-2"
											onClick={() => removeCourseProfessor(prf)}
										>
											<CloseIcon />
										</button>
									</div>
								</div>
							)}
						</div>
					</div>
				)}
				{!newProfessor && (
					<div className="flex items-center justify-start">
						<Label>Nuevo profesor</Label>
						<PlusButton size="small" className="ml-3" onClick={() => setNewProfessor(true)} />
					</div>)
				}
				{newProfessor && (
					<ProfessorInfo
						edit={edit}
						minStartAt={startAt}
						maxEndAt={isCircular.value ? undefined : endAt}
						periodToEdit={periodToEdit}
						editProfessor={(v, idx) => editPeriod(v, idx)}
						closeNewProfessor={(value) => { setNewProfessor(value); setPeriodToEdit({}) }}
						pushProfessor={(v) => {
							setCourseProfessors([...courseProfessors, v]);
							setNewProfessor(false);
						}}
					/>)
				}
			</form>
		</Modal>
	)
}

export default CreateUpdateCourseModal