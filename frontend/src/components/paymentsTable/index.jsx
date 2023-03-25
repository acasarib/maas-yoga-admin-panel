import React from "react";
import Table from "../table";

export default function PaymentsTable({ className = "", payments, isLoading }) {

    const columns = [
        {
            name: 'Proveniente de',
            selector: row => row.type,
            sortable: true,
        },
        {
            name: 'Importe',
            cell: row => <span className="w-16">{'$' + row.value}</span>,
            sortable: true,
            //maxWidth: '80px'
        },
        {
            name: 'Abonado por',
            selector: row => row.student !== null ? row?.student?.name + ' ' + row?.student?.lastName : "",
            sortable: true,
        },
        {
            name: 'Informado por',
            selector: row => row.user.firstName + ' ' + row.user.lastName,
            sortable: true,
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
            cell: row => (<>{row.fileId !== null &&<a href={`https://maas-yoga-admin-panel.onrender.com/api/v1/files/${row.fileId}`} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
            </a>}</>),
            sortable: true,
        },
    ];

    return(
        <Table
            className={`rounded-3xl shadow-lg ${className}`}
            columns={columns}
            data={payments}
            noDataComponent={isLoading ? 'Verificando pagos...' : 'No hay pagos disponibles'}
            pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
    );
} 