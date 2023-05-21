import React, { useContext } from "react";
import { Context } from "../../../context/Context";
import { useState } from "react";
import Modal from "../../modal";
import PaidIcon from '@mui/icons-material/Paid';
import ClassesTable from "../../classesTable";
import { twoDigits } from "../../../utils";

export default function VerifyPaymentClassesSection() {
    const { clazzes, verifyClazz, changeAlertStatusAndMessage } = useContext(Context);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [verifyingClazz, setVerifyingClazz] = useState(null);

    const onClazzClicked = (clazz) => {
        setIsModalOpen(true);
        setVerifyingClazz(clazz);
    }

    const handleVerifyClazz = async () => {
        try{
            await verifyClazz(verifyingClazz);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'La clase no pudo ser verificada... Por favor inténtelo nuevamente.')
        }
        setVerifyingClazz(null);
        setIsModalOpen(false);
    }

    const prettyMonth = date => new Intl.DateTimeFormat('es-ES', { month: 'long'}).format(date);

    const prettyDate = (date) => {
        date = new Date(date);
        return date instanceof Date ? `${date.getDate()} de ${prettyMonth(date)} del ${date.getFullYear()} a las ${date.getHours()}:${twoDigits(date.getMinutes())}` : "Fecha de pago invalida";
    }

    return (<>
        <div className="mb-6 md:my-6 mx-8 md:mx-4">
            <p className="mb-3">Los pagos de las siguientes clases no estan verificados. Haga click en una clase para marcar la clase y los pagos correspondientes a la clase como verificados.</p>
            <ClassesTable clazzes={clazzes.filter(clazz => !clazz.paymentsVerified)} onClazzClicked={onClazzClicked}/>
            <Modal
                icon={<PaidIcon />}
                open={isModalOpen}
                setDisplay={setIsModalOpen}
                buttonText={"Confirmar"}
                onClick={handleVerifyClazz}
                onClose={() => setVerifyingClazz(null)}
                title={"Confirmar pago"}
            >
                {verifyingClazz !== null && <>
                    <p>¿Confirmar ingresos de la clase <span className="font-bold">{verifyingClazz?.title}</span> dictada el <span className="font-bold">{prettyDate(verifyingClazz.startAt)}</span>?</p>
                    <p>Al confirmar los pagos de esta clase, ya no se podra informar esta clase a un nuevo ingreso.</p>
                </>}
            </Modal>
        </div>
    </>);
} 