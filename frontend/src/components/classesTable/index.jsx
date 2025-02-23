import React from "react";
import Table from "../table";
import { useEffect } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useState } from "react";
import { dateToString } from "../../utils";

export default function ClassesTable({ clazzes, onDelete, onEdit, onClazzClicked }) {
    const [opResult, setOpResult] = useState('Verificando clases...');

    useEffect(() => {
        if(clazzes.length === 0)
            setOpResult('No fue posible obtener las clases, por favor recargue la página...');
    }, [clazzes]);

    const columns = [
        {
            name: 'Titulo',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.title}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.title}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
            searchable: true,
            selector: row => row.title,
        },
        {
            name: 'Docente',
            selector: row => row.professor,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => dateToString(row.startAt),
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