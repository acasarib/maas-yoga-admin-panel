import React, { useEffect, useState } from "react";
import Modal from "../modal";
import HailIcon from '@mui/icons-material/Hail';
import Select from "react-select";
import CommonInput from "../commonInput";
import ButtonPrimary from "../button/primary";

export default function AddProfessorPaymentModal({ criteriaType, criteriaValue, totalStudents, period, criteria, total, payments, addPayment, isOpen, onClose, professorName }) {
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
    const [error, setError] = useState(false)

    const handleInform = () => {
        if (value.value == 'default') {
            addPayment()
        } else {
            addPayment(parseFloat(totalByStudents) *-1)
        }
        onClose()
    }

    useEffect(() => {
        console.log(criteriaType, "criteriaType");
        if (amountStudents == '') {
            setError(false)
            return
        }
        const amountStudentsInt = parseInt(amountStudents)
        if ((amountStudentsInt > totalStudents) || amountStudentsInt <= 0) {
            setError(true)
            return
        }
        setError(false)
        const paymentValue = payments[0].value
        if (criteriaType.split("-")[0] == "percentage") {
            setTotalByStudents((criteriaValue/100) * paymentValue * amountStudentsInt)
        } else {
            setTotalByStudents(criteriaValue * amountStudentsInt)
        }

    }, [amountStudents])
    

    const handleChangeSelectValue = (e) => {
        setAmountStudents("")
        setValue(e)
    }
    
    return(
        <Modal hiddingButton open={isOpen} icon={<HailIcon/>} setDisplay={onClose} title={'Profesor ' + professorName + " (" + period + ")"}>
            <Select className="mt-4" placeholder="Seleccionar" value={value} onChange={handleChangeSelectValue} options={values} />


            {value.value == 'amount_students' && 
            <>
                <div className="mt-4">
                    <CommonInput 
                        label="Cantidad de alumnos"
                        name="amount-payments"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="number" 
                        placeholder="Cantidad" 
                        value={amountStudents}
                        isInvalid={error}
                        invalidMessage={amountStudents <= 0 ? "La cantidad ingresada es incorrecta" : "La cantidad de alumnos seleccionada supera la cantidad de alumnos que abonaron en el periodo"}
                        onChange={(e) => setAmountStudents(e.target.value)}
                    />
                </div>
            </>}
            <div>
                <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4" role="alert">
                    <p className="font-bold">Detalle del informe</p>
                    <p>Profesor: <span className="font-bold">{professorName}</span></p>
                    <p>Periodo que dicta el profesor: <span className="font-bold">{period}</span></p>
                    <p>Alumnos que abonaron: <span className="font-bold">{totalStudents}</span></p>
                    <p>Pagos registrados en el periodo: <span className="font-bold">{payments.length}</span></p>
                    {value.value == 'amount_students' && amountStudents != '' && 
                        <p>Alumnos seleccionados: <span className="font-bold">{amountStudents}</span></p>
                    }
                    <p>{criteria.split(".")[0]}</p>
                    <p className="mt-4">Total a pagar: <span className="font-bold">${value.value == "default" ? total : totalByStudents}</span></p>
                </div>
                
            </div>
            <ButtonPrimary className="mt-2" onClick={handleInform}>Informar</ButtonPrimary>
        </Modal>
    );
}