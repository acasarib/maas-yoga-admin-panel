import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../context/Context";
import ImportModule from "./importModule";
import studentsService from "../../../services/studentsService";

export default function ImportStudents({ onCancel }) {
    const { newStudents } = useContext(Context);
    const [students, setStudents] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            const students = await studentsService.getStudentsLegacy();
            setStudents(students);
        }
        fetchData()
    }, [])
    

    const csvToObject = csv => {
        const onlyStudentsPermission = student => student["id_permiso"] === "3";
        const mapNull = str => str === "NULL" ? null : str;
        const mapDocument = str => {
            if (str === "NULL")
                return "0";
            str = str.replaceAll(".", "").replaceAll("+", "").replaceAll("E", "").trim();
            if (str === "")
                return "0";
            if (isNaN(str))
                return "0";
            return str;
        }
        const mapDate = date => {
            try {
                return new Date(date);
            } catch {
                return null;
            }
        }
        const mapFieldsToObject = student => ({
            id: mapNull(student.id),
            name: mapNull(student.nombre),
            lastName: mapNull(student.apellido),
            document: mapDocument(student.documento),
            email: mapNull(student.email),
            phoneNumber: mapNull(student.telefono),
            cellPhoneNumber: mapNull(student.celular),
            contact: mapNull(student.celular),
            image:  mapNull(student.imagen),
            alias: mapNull(student.alias),
            address: mapNull(student.direccion),
            occupation: mapNull(student.ocupacion),
            coverage: mapNull(student.cobertura),
            isSelected: true,
            createdAt: mapDate(student.create_at)
        });
        return csv
            .filter(onlyStudentsPermission)
            .map(mapFieldsToObject);
    }

    const getImageUrl = image => `https://apireservas.maasyoga.com.ar/uploads/${image}`

    const columns = [
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Imagen',
            cell: row => <div>{row.image !== null ? <img alt="imagen" height={34} src={getImageUrl(row.image)}/> : ""}</div>,
        },
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Documento',
            selector: row => row.document,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Telefono',
            selector: row => row.phoneNumber,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Celular',
            selector: row => row.cellPhoneNumber,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Contacto',
            selector: row => row.contact,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Alias',
            selector: row => row.alias,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Direccion',
            selector: row => row.address,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Ocupacion',
            selector: row => row.occupation,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Cobertura',
            selector: row => row.coverage,
            sortable: true,
            searchable: true,
        },
    ];

    const isAlreadyImported = student => students.some(st => st.email === student.email);

    return (<>
        <ImportModule
            onCancel={onCancel}
            moduleName="alumnos"
            csvToObject={csvToObject}
            isAlreadyImported={isAlreadyImported}
            columns={columns}
            onImport={newStudents}
        />
    </>);
} 