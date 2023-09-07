import React, { useContext, useEffect, useState, useMemo } from "react";
import { Context } from "../../../context/Context";
import "react-datepicker/dist/react-datepicker.css";
import { dateToString } from "../../../utils";
import Table from "../../table";
import { LOG_PAYMENT_ACTIONS } from "../../../constants";

export default function LogsPaymentSection(props) {
    const { getLogs } = useContext(Context);
    const [logs, setLogs] = useState([]);

    const fetchData = async () => {
        const l = await getLogs();
        setLogs(l);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const getPrettyLogAction = (action, paymentId) => {
        const payment = paymentId !== null ? paymentId : "(pago eliminado)";
        switch (action) {
            case LOG_PAYMENT_ACTIONS.CREATE:
                return `Creacion del pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.UPDATE:
                return `Se modifico el pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.VERIFICATION:
                return `Se verifico el pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.DELETE:
                return `Se elimino un pago`;
            default:
                return 'Error';
        }
    }
    
    const columns = useMemo(() => {
        const newColumns = [
            {
                name: 'Fecha',
                selector: row => dateToString(row.createdAt),
                sortable: true,
                searchable: true,
            },
            {
                name: 'Accion',
                cell: row => getPrettyLogAction(row.action, row.paymentId),
                sortable: true,
            },
            {
                name: 'Usuario',
                cell: row => row?.user?.firstName + " " + row?.user?.lastName,
                sortable: true,
                searchable: true,
            },
        ];
        return newColumns;
    }, []); 

    return (
        <>
        <div className="mb-6 md:my-6 md:mx-4">
            <Table
                className={`rounded-3xl shadow-lg`}
                columns={columns}
                data={logs}
                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
        </div>
        </>
    );
} 