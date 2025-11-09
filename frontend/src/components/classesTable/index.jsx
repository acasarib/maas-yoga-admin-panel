import React from "react";
import Table from "../table";
import { dateToString } from "../../utils";
import EditButton from "../button/editButton";
import DeleteButton from "../button/deleteButton";
import NoDataComponent from "../table/noDataComponent";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { COLORS } from '../../constants';

export default function ClassesTable({ clazzes, onDelete, onEdit, onClazzClicked, isLoading, disableActions }) {

    const columns = [
        {
            name: 'Título',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.title}
                <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.title}
                  <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
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
        }
    ];

    if (!disableActions) {
        columns.push(
        {
            name: 'Acciones',
            cell: row => (<div className="flex-row"><DeleteButton onClick={() => onDelete(row)} /><EditButton onClick={() => onEdit(row)} /></div>),
            sortable: true,
        })
    }

    const onRowClicked = (row) => {
        if (typeof onClazzClicked === "function")
            onClazzClicked(row);
    }

    return(
        <Table
            columns={columns}
            progressPending={isLoading}
            pointerOnHover={onClazzClicked !== undefined}
            highlightOnHover={onClazzClicked !== undefined}
            onRowClicked={onRowClicked}
            data={clazzes}
            pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            responsive
            noDataComponent={<NoDataComponent Icon={HistoryEduIcon} title="No hay clases" subtitle="No se encontraron clases registradas"/>}
        />
    );
} 