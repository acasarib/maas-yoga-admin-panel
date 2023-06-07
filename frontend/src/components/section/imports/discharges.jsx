import React, { useContext } from "react";
import ImportModule from "./importModule";
import { Context } from "../../../context/Context";
import { dateToString } from "../../../utils";


export default function ImportDischarges({ onCancel }) {
    const { payments, newSubscriptionClasses } = useContext(Context);
    const csvToObject = csv => {
        const mapNull = str => str === "NULL" ? null : str;
        const mapDate = date => {
            try {
                return new Date(date);
            } catch {
                return null;
            }
        }
        const mapFieldsToObject = payment => ({
            id: mapNull(payment.id),
            note: mapNull(payment.descripcion),
            at: mapDate(payment.fecha),
            createdAt: mapDate(payment.fecha),
            value: parseFloat(payment.valor)*-1,
        });
        
        return csv.map(mapFieldsToObject);
    }
    

    const columns = [
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Importe',
            selector: row => row.value,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Detalle',
            selector: row => row.note,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => dateToString(row.at),
            sortable: true,
            searchable: true,
        }
    ];

    const isAlreadyImported = payment1 => payments.some(payment2 => parseInt(payment1.id) === payment2.oldId && payment2.value < 0);

    return (<>
        <ImportModule
            onCancel={onCancel}
            moduleName="gastos"
            csvToObject={csvToObject}
            isAlreadyImported={isAlreadyImported}
            columns={columns}
            onImport={newSubscriptionClasses}
        />
    </>);
} 