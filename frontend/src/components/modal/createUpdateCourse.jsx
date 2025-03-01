import React, { useContext, useEffect, useState } from 'react'
import Modal from '../modal'
import { useFormik } from 'formik';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import CommonInput from '../commonInput';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { DateTimePicker } from '@mui/x-date-pickers';
import useToggle from '../../hooks/useToggle';
import dayjs from 'dayjs';
import CloseIcon from '@mui/icons-material/Close';
import { Context } from '../../context/Context';
import CustomCheckbox from '../checkbox/customCheckbox';
import PlusButton from '../button/plus';
import ProfessorInfo from '../courses/professorInfo'
import EditIcon from '@mui/icons-material/Edit';
import SelectStudent from '../select/selectStudent';


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
			<form className="pt-6 mb-4"
				method="POST"
				id="form"
				onSubmit={formik.handleSubmit}
			>
				<div className={`mb-4 relative col-span-2`}>
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
							Fecha de inicio
					</label>
					<DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
						<DateTimePicker
							label="Seleccionar fecha"
							value={startAt}
							onChange={setStartAt}
						/>
					</DemoContainer>
				</div>
				<div className={`mb-4 relative col-span-2 ${isCircular.value && "hidden"}`}>
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
							Fecha de finalizacion
					</label>
					<DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
						<DateTimePicker
								label="Seleccionar fecha"
								value={endAt}
								onChange={setEndAt}
						/>
					</DemoContainer>
				</div>
				<div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
					<CustomCheckbox
						checked={needsRegistration.value}
						labelOn="Posee matrícula"
						labelOff="Posee matrícula"
						className="ml-2"
						onChange={needsRegistration.toggle}
					/>
					<CustomCheckbox
						checked={isCircular.value}
						labelOn="Es circular"
						labelOff="Es circular"
						className="ml-2"
						onChange={isCircular.toggle}
					/>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="mb-4">
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
					</div>
					<div className="mb-4">
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
				</div>
				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2">
						Asignar alumnos
					</label>
					<SelectStudent
						className="z-100"
						isMulti
						onChange={handleChangeStudents}
						defaultValue={(edit && (courseToEdit.students)) ? courseToEdit.students : []}
					/>
				</div>
				{courseProfessors.length > 0 && (<>
						<label className="block text-gray-700 text-sm font-bold mb-2">
							Profesores
						</label>
						{courseProfessors.map((prf, index) =>
							<div key={index} className="my-1 px-3 py-2 bg-orange-50 flex justify-between items-center rounded-sm w-auto">
								<div>{prf.professor?.name} {prf.professor?.lastName}</div>
								<div>{edit && <button
												type="button"
												className="p-1 rounded-full bg-orange-200 ml-2"
												onClick={() => { setPeriodToEdit(prf); setNewProfessor(true) }}
											>
												<EditIcon />
											</button>
									}
									<button
										type="button"
										className="p-1 rounded-full bg-gray-100 ml-2"
										onClick={() => removeCourseProfessor(prf)}
									>
										<CloseIcon />
									</button>
								</div>
							</div>
						)}
					</>
				)}
				{!newProfessor && (
					<div className="mb-4 mt-2 flex items-center justify-start">
						<label className="block text-gray-700 text-sm font-bold">
							Nuevo profesor
						</label>
						<PlusButton fontSize="large" className="w-8 h-8 mt-0 ml-3" onClick={() => setNewProfessor(true)} />
					</div>)
				}
				{newProfessor && (
					<ProfessorInfo
						edit={edit}
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