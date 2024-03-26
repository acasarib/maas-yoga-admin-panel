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
import CourseProfessorCard from "../components/courses/CourseProfessorCalculation/courseProfessorCard";

export default function ProfessorPayments(props) {
    const { calcProfessorsPayments } = useContext(Context);
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [data, setData] = useState(null);
    const [activePaymentsShowing, setActivePaymentsShowing] = useState(null);

    const handleCalcProfessorsPayments = async () => {
        const parsedFrom = dateToYYYYMMDD(from.$d);
        const parsedTo = dateToYYYYMMDD(to.$d);
        console.log("Selected period: "+ parsedFrom + " - " + parsedTo);
        const data = await calcProfessorsPayments(parsedFrom, parsedTo);
        console.log("Data: ", data);
        setData(data);
    }

    const onInformPayment = payment => {
        setData(current => {
            current.forEach(course => {
                if (course.id === payment.courseId) {
                    course.professors.forEach(professor => {
                        if (professor.id === payment.professorId) {
                            professor.payments.push(payment);
                        }
                    });
                }
            });
            return current;
        })
    }

    return(
        <>
            <Container title="Calculo de pagos" items={[{ name: "Movimientos", href: "/home/payments" }, { name: "Calculo de pagos" }]}>
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
                        <ButtonPrimary disabled={from == null || to == null} onClick={handleCalcProfessorsPayments}>Calcular</ButtonPrimary>
                    </div>
                </div>
                {data !== null &&
                    data.map((d, i) => <CourseProfessorCard onInformPayment={onInformPayment} from={from} to={to} onShowPayments={setActivePaymentsShowing} key={i} course={d}/>)}
                <Modal
                    open={activePaymentsShowing !== null}
                    setDisplay={() => setActivePaymentsShowing(null)}
                    size="medium"
                    buttonText={"Cerrar"}
                    icon={<InfoIcon/>}
                    title={"Pagos"}
                    onClick={() => setActivePaymentsShowing(null)}
                >
                    {activePaymentsShowing !== null && (<>
                        <h2 className="text-xl">Periodo {dateToYYYYMMDD(from.$d)} - {dateToYYYYMMDD(to.$d)}</h2>
                        {activePaymentsShowing.map(payment => <PaymentInfo key={payment.id} payment={payment} />)}
                    </>)}
                </Modal>
            </Container>
        </>
    );
} 