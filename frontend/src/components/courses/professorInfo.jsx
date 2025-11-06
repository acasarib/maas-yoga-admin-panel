import React, { useState, useEffect } from "react";
import CommonInput from "../commonInput";
import dayjs from 'dayjs';
import { dateToYYYYMMDD, splitDate } from "../../utils";
import SelectProfessors from "../select/selectProfessors";
import DateInput from "../calendar/dateInput";
import Label from "../label/label";
import CustomCheckbox from "../checkbox/customCheckbox";
import CustomRadio from "../radio/customRadio";
import ButtonPrimary from "../button/primary";
import ButtonSecondary from "../button/secondary";

export default function ProfessorInfo(props) {
    const [startAt, setStartAt] = useState(dayjs(new Date()));
    const [endAt, setEndAt] = useState(dayjs(new Date()));  
    const [criteria, setCriteria] = useState('percentage'); 
    const [criteriaValue, setCriteriaValue] = useState(null);
    const [courseValue, setCourseValue] = useState("");
    const [professorSelected, setProfessorSelected] = useState(null); 
    const [isProfessorSelected, setIsProfessorSelected] = useState(false);

    const handleChangeCriteria = ({ student, percentage, assistance, assistant }) => {
        setCourseValue("")
        if (assistant) {
            setCriteria("assistant")
        } else if (student) {
            setCriteria(isCriteriaByAssistance() ? 'student-assistance':'student')
        } else if (percentage) {
            setCriteria(isCriteriaByAssistance() ? 'percentage-assistance':'percentage')
        } else if (assistance) {
            setCriteria(criteria.split("-")[0] + "-assistance")
        } else {
            setCriteria(criteria.split("-")[0])
        }
    }

    const isCriteriaByStudent = () => criteria.split("-")[0] === 'student'
    const isCriteriaByPercentage = () => criteria.split("-")[0] === 'percentage'
    const isCriteriaByAssistance = () => criteria.split("-")[1] === 'assistance'
    const isCriteriaByAssistant = () => criteria === 'assistant'

    const addProfessor = () => {
        const professor = {
            startAt: dateToYYYYMMDD(startAt.$d),
            endAt: dateToYYYYMMDD(endAt.$d),
            criteria: criteria,
            criteriaValue: criteriaValue,
            professorId: professorSelected.id
        }
        if (courseValue != "") {
            professor.courseValue = courseValue
        } 
        if (props.periodToEdit.professorId) {
            professor.id = props.periodToEdit.id;
        }
        professor.professor = professorSelected
        if (props.periodToEdit.professorId) {
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

    const cancel = () => {
        setCriteria(null);
        setCriteriaValue(null);
        setStartAt(dayjs(new Date()));
        setEndAt(dayjs(new Date()));
        setIsProfessorSelected(false);
        props.closeNewProfessor(false);
    }

    useEffect(() => {
        if(props.edit && (props.periodToEdit.endAt)) {
            console.log(props.periodToEdit)
            setEndAt(dayjs(splitDate(props.periodToEdit.endAt)));
            setStartAt(dayjs(splitDate(props.periodToEdit.startAt)));
            setCriteria(props.periodToEdit.criteria);
            setCriteriaValue(props.periodToEdit.criteriaValue);
            setCourseValue(props.periodToEdit.courseValue == null ? "" : props.periodToEdit.courseValue)
            setProfessorSelected(props.periodToEdit.professor);
            setIsProfessorSelected(true);
        }
    }, [props.periodToEdit])
    

    return (
        <div className="bg-gray-100 p-3 rounded flex flex-col gap-6 col-span-2">
            <div>
                <Label htmlFor="selectProfessor">Seleccionar profesor</Label>
                <SelectProfessors
                    name="selectProfessor"
                    onChange={(e) => {
                        setProfessorSelected(e);
                        setIsProfessorSelected(true);
                    }}
                    defaultValue={props.periodToEdit.professorId ? props.periodToEdit.professor : null}
                    className="z-50"
                />
            </div>
            {isProfessorSelected && (<>
                
                <div className="flex flex-col gap-4">
                    <DateInput
                        name="professorStartAt"
                        label="Profesor desde"
                        minDate={props.minStartAt}
                        errorMessage="La fecha en que dicta el profesor no puede ser anterior a la fecha de inicio del curso"
                        value={startAt}
                        onChange={(v) => setStartAt(v)}
                    />
                
                    <DateInput
                        name="professorEndAt"
                        label="Profesor hasta"
                        maxDate={props.maxEndAt || undefined}
                        errorMessage="La fecha en que dicta el profesor no puede ser posterior a la finalizacion del curso, a menos que el curso sea circular"
                        value={endAt}
                        onChange={(v) => setEndAt(v)}
                    />
                </div>
                <div>
                    <Label>Pago del profesor por:</Label>
                    <div className="divide-y ml-2 md:ml-4">
                        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-3">
                            <CustomRadio
                                value="percentage"
                                label="Porcentaje"
                                onChange={(e) => handleChangeCriteria({percentage: e.target.value === "percentage"})}
                                checked={isCriteriaByPercentage()}
                            />
                            <CustomRadio
                                value="student"
                                label="Estudiante"
                                onChange={(e) => handleChangeCriteria({student: e.target.value === "student"})}
                                checked={isCriteriaByStudent()}
                            />
                            <CustomRadio                            
                                label="Ayudantía"
                                value="assistant"
                                onChange={(e) => handleChangeCriteria({assistant: e.target.value === "assistant"})}
                                checked={isCriteriaByAssistant()}
                            />
                        </div>
                        <div className={`flex items-center mt-4 ${isCriteriaByAssistant() && "hidden"}`}>
                            <CustomCheckbox
                                onChange={(e) => handleChangeCriteria({assistance: e.target.checked})}
                                checked={isCriteriaByAssistance()}
                                value="assistance"
                                label="Por asistencia"
                            />
                        </div>
                    </div>
                </div>
                <div className="sm:w-3/6">
                    <CommonInput 
                        label={isCriteriaByAssistant() ? "Monto por ayudantía" : isCriteriaByPercentage() ? "Porcentaje" : "Cantidad por alumno"}    
                        value={criteriaValue}
                        name="criteriaValue"
                        symbol={isCriteriaByAssistant() ? "$" : isCriteriaByPercentage() ? "%" : "$"}
                        id="criteriaValue" 
                        min='0'
                        type="number" 
                        placeholder={isCriteriaByAssistant() ? "Monto" : isCriteriaByPercentage() ? "Porcentaje" : "Cantidad por alumno"}
                        onChange={(e) => setCriteriaValue(e.target.value)}
                    />
                </div>
                <div className={`sm:w-3/6 ${!isCriteriaByPercentage() && "hidden"}`}>
                    <CommonInput
                        label="Valor del curso"
                        min='0'
                        currency
                        value={courseValue}
                        name="courseValue"
                        id="courseValue" 
                        type="number" 
                        placeholder="Valor del curso"
                        onChange={(e) => setCourseValue(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4 sm:flex">
                    <ButtonSecondary onClick={cancel}>Cancelar</ButtonSecondary>
                    <ButtonPrimary onClick={addProfessor}>
                        {props.periodToEdit.professorId ? 'Editar' : 'Agregar'}
                    </ButtonPrimary>
                </div></>)
            }
        </div>
    );
} 