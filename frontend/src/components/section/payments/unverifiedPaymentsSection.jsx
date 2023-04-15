import React, { useContext } from "react";
import PaymentsTable from "../../paymentsTable";
import { Context } from "../../../context/Context";
import { Link } from "react-router-dom";

export default function UnverifiedPaymentsSections() {
    const { payments, isLoadingPayments } = useContext(Context);

    return (<>
        <div className="mb-6 md:my-6 mx-8 md:mx-4">
            <p className="mb-3">Los siguientes pagos en efectivo corresponden a ingresos sobre clases y no estan verificados. Puede verificar los pagos en "Verificar pagos" de la seccion <Link className="text-blue" to={`/home/classes`}>clases</Link></p>
            <PaymentsTable
                payments={payments.filter(payment => !payment.verified)}
                isLoading={isLoadingPayments}
            />
        </div>
    </>);
} 