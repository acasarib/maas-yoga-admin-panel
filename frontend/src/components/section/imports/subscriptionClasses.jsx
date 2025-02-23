import React, { useContext, useEffect, useState } from "react";
import ImportModule from "./importModule";
import { Context } from "../../../context/Context";
import { dateToString } from "../../../utils";
import Spinner from "../../spinner/spinner";
import paymentsService from "../../../services/paymentsService";


export default function ImportSubscriptionClasses({ onCancel }) {
    const { newSubscriptionClasses } = useContext(Context);

    const [payments, setPayments] = useState([]);
    
    const fetchAllPayments = async () => {
        //TODO: Codigo viejo, en algun momento tenemos que actualizar esto. No es urgente, nunca lo usaron y parece no usarse
        const p = await paymentsService.legacyGetAll();
        setPayments(p);
    }

    useEffect(() => {
        fetchAllPayments();
    }, [])

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
            name: mapNull(payment.nombre),
            lastName: mapNull(payment.apellido),
            email: mapNull(payment.email),
            createdAt: mapDate(payment.fecha),
            at: mapDate(payment.fecha),
            headquarterName: mapNull(payment.location_name),
            value: mapNull(payment.valor),
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
            name: 'Nombre del alumno',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido del alumno',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Email del alumno',
            selector: row => row.email,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => dateToString(row.at),
            sortable: true,
            searchable: true,
        },
        {
            name: 'Sede',
            selector: row => row.headquarterName,
            sortable: true,
            searchable: true,
        },
    ];

    const isAlreadyImported = payment1 => payments.some(payment2 => parseInt(payment1.id) === payment2.oldId && payment2.value >= 0);

    return (<>{payments.length === 0 ? <Spinner/> : 
        <ImportModule
            onCancel={onCancel}
            moduleName="abono de clases"
            csvToObject={csvToObject}
            isAlreadyImported={isAlreadyImported}
            columns={columns}
            onImport={newSubscriptionClasses}
        />
    }
    </>);
} 