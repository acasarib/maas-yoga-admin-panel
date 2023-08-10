import React, { useState, useContext } from "react";
import Modal from "../components/modal";
import "react-datepicker/dist/react-datepicker.css";
import InfoIcon from '@mui/icons-material/Info';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Container from "../components/container";
import { Context } from "../context/Context";
import ButtonPrimary from "../components/button/primary";
import { dateToYYYYMMDD } from "../utils";
import PaymentInfo from "../components/paymentInfo";
import paymentsService from "../services/paymentsService";
import CourseProfessorCard from "../components/courses/CourseProfessorCalculation/courseProfessorCard";

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
                    data.map((d, i) => <CourseProfessorCard key={i} course={d}/>)}
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