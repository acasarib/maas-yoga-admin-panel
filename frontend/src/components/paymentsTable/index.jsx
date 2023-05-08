import React, { useEffect } from "react";
import Table from "../table";

export default function PaymentsTable({ className = "", payments, isLoading }) {

    const getBalanceForAllPayments = () => {
        let value = 0;
        payments.forEach(payment => {
            value = value + payment.value;
        });
        return value;
    }

    const getPayments = () => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value >= 0) {
                value = value + payment.value;
            }
        });
        return value;
    }

    const getDischarges = () => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value < 0) {
                value = value + payment.value;
            }
        });
        return value * -1;
    }

    const columns = [
        {
            name: 'Modo de pago',
            cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{row.type}</span>,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Importe',
            cell: row => <span className={(row.value >= 0) ? "w-16 text-gray-800 font-bold" : "w-16 text-red-800 font-bold"}>{'$' + row.value}</span>,
            sortable: true,
            //maxWidth: '80px'
        },
        {
            name: 'Abonado por',
            cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{row.student !== null ? row?.student?.name + ' ' + row?.student?.lastName : ""}</span>,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Informado por',
            cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{row.user.firstName + ' ' + row.user.lastName}</span>,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => {var dt = new Date(row.createdAt);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date},
            sortable: true,
            maxWidth: '80px'
        },
        {
            name: 'Comprobante',
            cell: row => (<>{row.fileId !== null &&<a href={`${process.env.REACT_APP_BACKEND_HOST}api/v1/files/${row.fileId}`} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
            </a>}</>),
            sortable: true,
        },
    ];

    useEffect(() => {
        getBalanceForAllPayments();
    }, [payments]);

    return(
        <>
            <Table
                className={`rounded-3xl shadow-lg ${className}`}
                columns={columns}
                data={payments}
                noDataComponent={isLoading ? 'Verificando pagos...' : 'No hay pagos disponibles'}
                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
            <div className="bg-orange-200 rounded-2xl px-8 py-4 mt-8 flex flex-row">
                <div className="mr-12">Total: <span className={(getBalanceForAllPayments() >= 0) ? 'text-gray-800 font-bold bg-white rounded-2xl py-2 px-3' : 'text-red-800 font-bold bg-white rounded-2xl py-2 px-3'}>${getBalanceForAllPayments()}</span></div>
                <div className="mx-12">Ingresos: <span className="text-gray-800 font-bold bg-white rounded-2xl py-2 px-3">${getPayments()}</span></div>
                <div className="mx-12">Egresos: <span className="text-red-800 font-bold bg-white rounded-2xl py-2 px-3">${getDischarges()}</span></div>
            </div>
        </>
    );
} 