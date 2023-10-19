import React, { useState, useEffect } from "react";
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CommonInput from "../commonInput";
import dayjs from 'dayjs';
import Select from 'react-select';
import { dateToYYYYMMDD, splitDate } from "../../utils";

export default function ProfessorInfo(props) {
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [endAt, setEndAt] = useState(dayjs(new Date()));  
    const [criteria, setCriteria] = useState('percentage'); 
    const [criteriaValue, setCriteriaValue] = useState(null);   
    const [id, setId] = useState(null); 
    const [criteriaCheck, setCriteriaCheck] = useState(false);
    const [isProfessorSelected, setIsProfessorSelected] = useState(false);

    const addProfessor = () => {
        const professor = {
            startAt: dateToYYYYMMDD(startAt.$d),
            endAt: dateToYYYYMMDD(endAt.$d),
            criteria: criteria,
            criteriaValue: criteriaValue,
            professorId: id
        }
        if(props.periodToEdit.professorId) {
            professor.id = props.periodToEdit.id;
            props.editProfessor(professor, props.periodToEdit.id);
        }else {
            props.pushProfessor(professor);
        }
        setIsProfessorSelected(false);
        setCriteria(null);
        setCriteriaValue(null);
        setStartAt(dayjs(new Date()));
        setEndAt(dayjs(new Date()));
    }

    const getProfessorById = professorId => props.professors.find(professor => professor.id === professorId);

    const cancel = () => {
        setCriteria(null);
        setCriteriaValue(null);
        setStartAt(dayjs(new Date()));
        setEndAt(dayjs(new Date()));
        setIsProfessorSelected(false);
        props.closeNewProfessor(false);
    }

    useEffect(() => {
        if(criteriaCheck) {
            setCriteria('student');
        }else {
            setCriteria('percentage');
        }
    }, [criteriaCheck])

    useEffect(() => {
        if(props.edit && (props.periodToEdit.endAt)) {
            if(criteria === 'student') {
                setCriteriaCheck(true);
                setCriteria('student');
            }else {
                setCriteriaCheck(false);
            }
        }
    }, [criteria])

    useEffect(() => {
        if(props.edit && (props.periodToEdit.endAt)) {
            console.log(props.periodToEdit)
            setEndAt(dayjs(splitDate(props.periodToEdit.endAt)));
            setStartAt(dayjs(splitDate(props.periodToEdit.startAt)));
            setCriteria(props.periodToEdit.criteria);
            setCriteriaValue(props.periodToEdit.criteriaValue);
            setId(props.periodToEdit.professorId);
            setIsProfessorSelected(true);
        }
    }, [props.periodToEdit])
    

    return (
        <div className="my-3 bg-gray-100 p-3 rounded">
            <label className="block text-gray-700 text-sm font-bold mb-2">
                Seleccionar profesor
            </label>
            <Select onChange={(e) => {
                    setId(e.id);
                    setIsProfessorSelected(true);
                }
            } defaultValue={props.periodToEdit.professorId ? getProfessorById(props.periodToEdit.professorId) : null} options={props.professors} className="z-50"/>
            {isProfessorSelected && (<><div className="my-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    Profesor desde
                </label>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                        <DatePicker
                        label="Seleccionar fecha"
                        value={startAt}
                        onChange={(v) => setStartAt(v)}
                        />
                    </DemoContainer>
                <label className="block text-gray-700 text-sm font-bold mb-2 mt-2">
                    Profesor hasta
                </label>
                    <DemoContainer components={['DatePicker', 'DatePicker']}>
                        <DatePicker
                        label="Seleccionar fecha"
                        value={endAt}
                        onChange={(v) => setEndAt(v)}
                        />
                    </DemoContainer>
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-4">
                    Pago del profesor por:
                </label>
                <div className="flex items-center mb-4 ml-2 md:ml-4">
                    <input onChange={() => setCriteriaCheck(!criteriaCheck)} name="criteria" id="criteria-percentage" type="radio" checked={!criteriaCheck} value="percentage" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="criteria-percentage" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-900">Porcentaje</label>
                </div>
                <div className="flex items-center ml-2 md:ml-4">
                    <input onChange={() => setCriteriaCheck(!criteriaCheck)} name="criteria" id="criteria-student" checked={criteriaCheck} value="student" type="radio" className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                    <label htmlFor="criteria-student" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-900">Estudiante</label>
                </div>
            </div>
            <div className="mb-4 w-3/6">
                <CommonInput 
                    label={!criteriaCheck ? "Porcentaje" : "Cantidad por alumno"}    
                    value={criteriaValue}
                    name="criteriaValue"
                    id="criteriaValue" 
                    type="number" 
                    placeholder={!criteriaCheck ? "Porcentaje" : "Cantidad por alumno"}
                    onChange={(e) => setCriteriaValue(e.target.value)}
                />
            </div>
            <div className="flex flex-row gap-4">
                <button
                    type="button"
                    className="hover:bg-orange-550 bg-orange-300 hover:text-white rounded-md border border-transparent px-4 py-2 text-base font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm"
                    onClick={() => addProfessor()}
                >
                    {props.periodToEdit.professorId ? 'Editar' : 'Agregar'}
                </button>
                <button
                    type="button"
                    className="focus:outline-none focus:ring-2 focus:ring-gray-500 hover:bg-white bg-orange-50 border-gray-300 text-yellow-900 rounded-md border border-transparent px-4 py-2 font-medium text-yellow-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 sm:text-sm"
                    onClick={() => cancel()}
                >
                    Cancelar
                </button>
            </div></>)}
        </div>
    );
} 