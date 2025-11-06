import React, { useContext, useEffect, useState } from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import CommonInput from "../commonInput";
import ButtonPrimary from "../button/primary";
import { Context } from "../../context/Context";
import { formatPaymentValue, getMonthNameByMonthNumber, isByAssistance } from "../../utils";
import ButtonSecondary from "../button/secondary";
import useToggle from "../../hooks/useToggle";
import PaymentInfo from "../paymentInfo";
import CustomCheckbox from "../checkbox/customCheckbox";
import Select from "../select/select";
import Label from "../label/label";

export default function AddProfessorPaymentModal({ courseValue, allowManualValue = false, courseId, selectedPeriod, criteriaType, criteriaValue, totalStudents, period, criteria, total, payments, addPayment, isOpen, onClose, professorName }) {
    const { getCourseDetailsById, changeAlertStatusAndMessage } = useContext(Context)
    const [course, setCourse] = useState(null)
    const isViewingPayments = useToggle()
    const [manualValue, setManualValue] = useState("")
    const [selectedStudents, setSelectedStudents] = useState([])
    const [students, setStudents] = useState([])
    const [studentsPayments, setStudentsPayments] = useState([])
    const isAllSelected = useToggle()
    const [manualValueEnabled, setManualValueEnabled] = useState(false)
    const values = [
        {
            value: 'default',
            label: 'Todos los pagos'
        },
        {
            value: 'amount_students',
            label: 'Cantidad de alumnos'
        },
    ]
    const [value, setValue] = useState({
        value: 'default',
        label: 'Todos los pagos'
    })
    const [amountStudents, setAmountStudents] = useState("")
    const [totalByStudents, setTotalByStudents] = useState("")

    const fetchCourse = async () => {
        const course = await getCourseDetailsById(courseId);
        setStudents(course.students)
        setCourse(course);
    }

    useEffect(() => {
        fetchCourse();
    }, [courseId])

    const handleInform = () => {
        if (manualValueEnabled) {
            addPayment(parseFloat(manualValue) *-1)
            onClose()
            return
        }
        if (value.value == 'default') {
            addPayment()
        } else {
            addPayment(parseFloat(totalByStudents) *-1)
        }
        onClose()
    }

    useEffect(() => {
        setStudentsPayments(payments.filter(p => selectedStudents.some(st => st.id == p.studentId)))
    }, [selectedStudents])

    useEffect(() => {
        let totalCollectedPayments = 0;
        const isByPercentage = criteriaType.split("-")[0] == "percentage"
        studentsPayments.forEach(payment => {
            const amount = isByPercentage ? courseValue : criteriaValue;// Si es por porcentaje, valor del curso. Sino es por estudiante, valor por cada estudiante
            if (amount == null || amount == undefined) {
                changeAlertStatusAndMessage(true, 'warning', 'No se ha indicado ' + (isByPercentage ? "valor del curso" : "cantidad por estudiante") + " para este profesor en este periodo.")
            }
            const discount = payment.discount == null ? 1 : 1 - (payment.discount/100) // Si tiene descuento, aplico descuento
            totalCollectedPayments += amount * discount
        });
        if (isByPercentage) {
            setTotalByStudents((criteriaValue/100) * totalCollectedPayments)
        } else {
            setTotalByStudents(totalCollectedPayments)
        }
    }, [studentsPayments])

    const handleChangeSelectValue = (e) => {
        setSelectedStudents([])
        setValue(e)
    }

    const enableManualValue = () => {
        setManualValueEnabled(true)
    }
    
    const disableManualValue = () => {
        setManualValueEnabled(false)
    }

    const formatSelectedPeriod = () => {
        const [year, month] = selectedPeriod.split("-")
        return year +  " " + getMonthNameByMonthNumber(month)
    }

    const handleSelectAll = () => {
        isAllSelected.toggle()
        if (!isAllSelected.value) {
            setSelectedStudents([...students])
        } else {
            setSelectedStudents([])
        }
    }

    const onChangeSelectedStudents = (newValue) => {
        setSelectedStudents(newValue)
        setAmountStudents(newValue.length)
    }
    
    return(
        <Modal
            open={isOpen}
            icon={<HailIcon/>}
            setDisplay={onClose}
            title={'Profesor ' + professorName + " (" + period + ")"}
            buttonText="Informar"
            onClick={handleInform}
        >
            {isOpen && <>
            {allowManualValue && manualValueEnabled ? <div>
                <CommonInput
                    label="Monto"   
                    currency 
                    value={manualValue}
                    name="value"
                    htmlFor="value"
                    id="value" 
                    type="number" 
                    placeholder="Monto"
                    onChange={(e) => setManualValue(e.target.value)}
                />
            </div>
            
            :
            <>
            {isByAssistance(criteriaType) && 
                <div>
                    <Label htmlFor="studentsAssistance">Seleccionar</Label>
                    <Select
                        name="studentsAssistance"
                        placeholder="Seleccionar"
                        value={value}
                        onChange={handleChangeSelectValue}
                        options={values}
                    />
                </div>
            }

            {value.value == 'amount_students' &&  
            <>
                <div className="mt-6">
                    <Label htmlFor="students">Alumnos</Label>
                    <Select
                        name="students"
                        placeholder="Seleccionar"
                        value={selectedStudents}
                        isMulti
                        onChange={onChangeSelectedStudents}
                        options={students}
                        getOptionLabel={(student)=> student.name + " " + student.lastName}
                        getOptionValue={(student)=> student.id} 
                    />
                    <CustomCheckbox checked={isAllSelected.value} onChange={handleSelectAll} label="Seleccionar todos"/>
                </div>
            </>}
            <div>
                {isViewingPayments.value ? 
                <div>
                    <div>
                        {value.value == 'amount_students' ? 
                            studentsPayments.map(payment => <PaymentInfo highLightFields={["student"]} hideFields={["course"]} key={payment.id} payment={payment}/>) 
                            : payments.map(payment => <PaymentInfo highLightFields={["student"]} hideFields={["course"]} key={payment.id} payment={payment}/>)}
                    </div>
                    <div className="underline cursor-pointer" onClick={isViewingPayments.disable}>
                        Ocultar pagos
                    </div>
                </div>
                :
                <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                    <p className="font-bold">Detalle del informe</p>
                    <p>Profesor: <span className="font-bold">{professorName}</span></p>
                    <p>Curso: <span className="font-bold">{course?.title}</span></p>
                    <p>Periodo que dicta el profesor: <span className="font-bold">{period}</span></p>
                    {selectedPeriod && <p>Periodo seleccionado: <span className="font-bold">{formatSelectedPeriod()}</span></p>}
                    <p>Alumnos que abonaron: <span className="font-bold">{totalStudents}</span></p>
                    <p>Pagos registrados en el periodo: <span className="font-bold">{payments.length}</span></p>
                    {courseValue && <p>Valor del curso: <span className="font-bold">{formatPaymentValue(courseValue)}</span></p>}
                    {value.value == 'amount_students' && amountStudents != '' && 
                        <p>Alumnos seleccionados: <span className="font-bold">{amountStudents}</span></p>
                    }
                    <p>{criteria}</p>
                    <p className="mt-4">Total a pagar: <span className="font-bold">{value.value == "default" ? formatPaymentValue(total) : formatPaymentValue(totalByStudents)}</span></p>
                    <p className="underline cursor-pointer" onClick={isViewingPayments.enable}>Ver pagos</p>
                </div>
                }
            </div>
            </>
            }
            {allowManualValue && 
                <> {manualValueEnabled ? <ButtonSecondary className="mt-4" onClick={disableManualValue}>Calcular monto</ButtonSecondary> : <ButtonSecondary className="mt-4" onClick={enableManualValue}>Otro monto</ButtonSecondary>}
                </>}
            </>}
        </Modal>
    );
}