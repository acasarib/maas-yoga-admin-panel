import React, { useState, useEffect, useContext } from "react";
import Modal from "../components/modal";
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import CommonInput from "../components/commonInput";
import "react-datepicker/dist/react-datepicker.css";
import DeleteIcon from '@mui/icons-material/Delete';
import Select from 'react-select';
import SchoolIcon from '@mui/icons-material/School';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import InfoIcon from '@mui/icons-material/Info';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TaskModal from "../components/courses/taskModal";
import Table from "../components/table";
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import { Context } from "../context/Context";
import ButtonPrimary from "../components/button/primary";
import { dateToYYYYMMDD } from "../utils";
import PaymentsTable from "../components/paymentsTable";
import PaymentInfo from "../components/paymentInfo";
import paymentsService from "../services/paymentsService";

export default function ProfessorPayments(props) {
    const { calcProfessorsPayments, changeAlertStatusAndMessage } = useContext(Context);

    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [data, setData] = useState(null);
    const [activeCourseModal, setActiveCourseModal] = useState(null);

    const handleCalcProfessorsPayments = async () => {
        const parsedFrom = dateToYYYYMMDD(from.$d);
        const parsedTo = dateToYYYYMMDD(to.$d);
        console.log("Selected period: "+ parsedFrom + " - " + parsedTo);
        const data = await calcProfessorsPayments(parsedFrom, parsedTo);
        console.log("Data: ", data);
        setData(data);
    }

    const addPayment = async (payment) => {
        const parsedFrom = dateToYYYYMMDD(from.$d);
        const parsedTo = dateToYYYYMMDD(to.$d);
        payment.from = parsedFrom;
        payment.to = parsedTo;
        try { 
            await paymentsService.informProfessorPayment(payment);
            changeAlertStatusAndMessage(true, 'success', 'El movimiento fue informado exitosamente!')
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El movimiento no pudo ser informado... Por favor inténtelo nuevamente.')
        }
    }

    const getModalTitle = () => {
        if (activeCourseModal === null)
            return "";
        else 
            return "Pagos del curso " + activeCourseModal?.course?.title;
    }

    return(
        <>
            <Container title="Calculo de pagos">
                <h2 className="text-xl mb-2">Rango:</h2>
                <div className="flex">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Fecha de inicio
                        </label>
                        <DateTimePicker
                            label="Seleccionar fecha"
                            value={from}
                            onChange={(newValue) => setFrom(newValue)}
                        />
                    </div>
                    <div className="ml-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Fecha de fin
                        </label>
                        <DateTimePicker
                            label="Seleccionar fecha"
                            value={to}
                            onChange={(newValue) => setTo(newValue)}
                        />
                    </div>
                    <div className="ml-2 mt-8">
                        <ButtonPrimary onClick={handleCalcProfessorsPayments}>Calcular</ButtonPrimary>
                    </div>
                </div>

                {data !== null &&
                    data.map((d, i) => (<div key={i} className="mt-2 w-full flex flex-col border rounded p-4 shadow-md bg-white mb-4">
                        <span>Curso: {d.course.title}</span>
                        <span>Profesor: {d.professor}</span>
                        <span>Estudiantes que abonaron el curso: {d.totalStudents}</span>
                        <span>Total de ingresos: {d.collectedByPayments}$</span>
                        <span>Total a pagar al profesor: {d.collectedByProfessor}$</span>
                        <span>Criterio: {d.criteria === "percentage" ? `Se debe pagar el ${d.criteriaValue}% del total de ingresos` : `Se debe pagar ${d.criteriaValue}$ por cada estudiante`}</span>
                        <div className="mt-2 md:mt-4 md:flex md:flex-row justify-center gap-12">
                            <ButtonPrimary onClick={() => addPayment(d)}>Informar</ButtonPrimary>
                            <ButtonPrimary onClick={() => setActiveCourseModal(d)}>Ver pagos</ButtonPrimary>
                        </div>
                    </div>))
                }
                <Modal
                    open={activeCourseModal !== null}
                    setDisplay={() => setActiveCourseModal(null)}
                    size="medium"
                    buttonText={"Cerrar"}
                    icon={<InfoIcon/>}
                    title={getModalTitle()}
                    onClick={() => setActiveCourseModal(null)}
                >
                    {activeCourseModal !== null && (<>
                        <h2 className="text-xl">Periodo {dateToYYYYMMDD(from.$d)} - {dateToYYYYMMDD(to.$d)}</h2>
                        {activeCourseModal.payments.map(payment => <PaymentInfo key={payment.id} payment={payment} />)}
                    </>)}
                </Modal>
            </Container>
        </>
    );
} 