import React from "react";
import Table from "../table";
import { useEffect } from "react";
import { useContext } from "react";
import { Context } from "../../context/Context";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";

export default function ClassesTable({ clazzes, onDelete, onEdit, onClazzClicked }) {

    const [opResult, setOpResult] = useState('Verificando clases...');
    const { isLoadingClazzes } = useContext(Context);

    useEffect(() => {
        if(clazzes.length === 0 && !isLoadingClazzes)
            setOpResult('No fue posible obtener las clases, por favor recargue la página...');
    }, [clazzes, isLoadingClazzes]);

    const columns = [
        {
            name: 'Titulo',
            selector: row => row.title,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Docente',
            selector: row => row.professor,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => {var dt = new Date(row.startAt);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                let hour  = dt.getHours();
                let mins  = String(dt.getMinutes()).padStart(2, '0'); 
                var date = `${day}/${month}/${year} ${hour}:${mins}`; return date},
            sortable: true,
            searchable: true,
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => onDelete(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => onEdit(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const onRowClicked = (row) => {
        if (typeof onClazzClicked === "function")
            onClazzClicked(row);
    }

    return(
        <Table
            columns={columns}
            pointerOnHover={onClazzClicked !== undefined}
            highlightOnHover={onClazzClicked !== undefined}
            onRowClicked={onRowClicked}
            data={clazzes}
            pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            responsive
            noDataComponent={opResult}
        />
    );
} 