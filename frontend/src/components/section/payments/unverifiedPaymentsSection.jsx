import React, { useContext } from "react";
import PaymentsTable from "../../paymentsTable";
import { Context } from "../../../context/Context";
import { Link } from "react-router-dom";

export default function UnverifiedPaymentsSections({ defaultSearchValue, defaultTypeValue, }) {
    const { payments, isLoadingPayments } = useContext(Context);

    return (<>
        <div className="mb-6 md:my-6 mx-8 md:mx-4">
            <PaymentsTable
                payments={payments.filter(payment => !payment.verified)}
                isLoading={isLoadingPayments}
                canVerify
                defaultSearchValue={defaultSearchValue}
                defaultTypeValue={defaultTypeValue}
            />
        </div>
    </>);
} 