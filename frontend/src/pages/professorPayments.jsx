import React, { useState, useContext } from "react";
import Modal from "../components/modal";
import "react-datepicker/dist/react-datepicker.css";
import InfoIcon from '@mui/icons-material/Info';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Container from "../components/container";
import { Context } from "../context/Context";
import ButtonPrimary from "../components/button/primary";
import { dateToYYYYMMDD } from "../utils";
import PaymentInfo from "../components/paymentInfo";
import CourseProfessorCard from "../components/courses/CourseProfessorCalculation/courseProfessorCard";
import useToggle from "../hooks/useToggle";
import Loader from "../components/spinner/loader";
import coursesService from "../services/coursesService";
import DateInput from "../components/calendar/dateInput";

export default function ProfessorPayments(props) {
    const { calcProfessorsPayments } = useContext(Context);
    const isLoading = useToggle()
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);
    const [data, setData] = useState(null);
    const [activePaymentsShowing, setActivePaymentsShowing] = useState(null);

    const handleCalcProfessorsPayments = async () => {
        isLoading.enable()
        const parsedFrom = dateToYYYYMMDD(from.$d);
        const parsedTo = dateToYYYYMMDD(to.$d);
        console.log("Selected period: "+ parsedFrom + " - " + parsedTo);
        const data = await calcProfessorsPayments(parsedFrom, parsedTo);            
        const sortedData = data.sort((a, b) => a?.title?.localeCompare(b?.title))   
        console.log("Data: ", sortedData);
        setData(sortedData);
        isLoading.disable()
    }

    const handleExportPayments = async () => {
        try {
            const parsedFrom = dateToYYYYMMDD(from.$d);
            const parsedTo = dateToYYYYMMDD(to.$d);
            
            const response = await coursesService.exportProfessorsPayments(parsedFrom, parsedTo);
            
            // Create blob and download
            const blob = new Blob([response], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pagos-profesores-${parsedFrom}-${parsedTo}.xlsx`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar:', error);
        }
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
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Fecha de inicio
                            </label>
                            <DateInput
                                className="w-full sm:w-auto"
                                label="Seleccionar fecha"
                                value={from}
                                onChange={(newValue) => setFrom(newValue)}
                            />
                        </div>
                        <div className="sm:ml-2">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                Fecha de fin
                            </label>
                            <DateInput
                                className="w-full sm:w-auto"
                                label="Seleccionar fecha"
                                value={to}
                                onChange={(newValue) => setTo(newValue)}
                            />
                        </div>
                    </div>
                    <div className="sm:ml-2 mt-6 flex items-center gap-2">
                        {isLoading.value ? (<div className="w-full flex justify-center items-center gap-2">
                            <Loader />
                        </div>) : (
                            <>
                            <ButtonPrimary
                                disabled={from == null || to == null}
                                onClick={handleCalcProfessorsPayments}
                                className="w-1/2 sm:w-auto"
                            >
                                Calcular
                            </ButtonPrimary>

                            <ButtonPrimary
                                disabled={from == null || to == null || data == null}
                                onClick={handleExportPayments}
                                className="w-1/2 sm:w-auto flex justify-center items-center"
                            >
                                <FileDownloadIcon className="mr-1" fontSize="small" />
                                Descargar
                            </ButtonPrimary>
                            </>
                        )}
                        </div>
                </div>
                {data !== null &&
                    data.map((d, i) => <CourseProfessorCard onInformPayment={onInformPayment} from={from} to={to} onShowPayments={setActivePaymentsShowing} key={i} course={d}/>)}
                <Modal
                    open={activePaymentsShowing !== null}
                    setDisplay={() => setActivePaymentsShowing(null)}
                    size="medium"
                    footer={false}
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