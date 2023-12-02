import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../../context/Context";
import dayjs from 'dayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Table from "../../table";

export default function AgendaPayments() {

    const { agendaLocations, getAgendaCashValues } = useContext(Context);
    const allLocation = { id: 'all', label:"Todas", value: 'all' };
    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));
    const [localAgendaLocations, setLocalAgendaLocations] = useState([]); 
    const [selectedAgendaLocation, setSelectedAgendaLocation] = useState('');
    const [agendaCashValues, setAgendaCashValues] = useState([])

    useEffect(() => {
        const fetchData = async (year, month, location) => {
            setAgendaCashValues(await getAgendaCashValues(year, month, location));
        }
        if (selectedAgendaLocation != '' && selectedDate) {
            const year = selectedDate.$d.getFullYear();
            const month = selectedDate.$d.getMonth() +1;
            const location = selectedAgendaLocation.value == 'all' ? null : selectedAgendaLocation.value;
            fetchData(year, month, location)
        }
    }, [selectedAgendaLocation, selectedDate]);
    

    useEffect(() => {
        console.log(agendaCashValues);
    }, [agendaCashValues]);

    useEffect(() => {
        setLocalAgendaLocations([allLocation,...agendaLocations]);
    }, [agendaLocations]);

    useEffect(() => {
        if (localAgendaLocations.length > 0) {
            setSelectedAgendaLocation(localAgendaLocations.filter(l => l.id == 'all')[0]);
        }
    }, [localAgendaLocations]);

    const columns = [
        {
            name: 'Valor',
            cell: row => "$" + row.valor,
            sortable: true,
            searchable: true,
            selector: row => row.valor,
        },
        {
            name: 'Acreditado',
            cell: row => row.acreditado == '0' ? 'No' : 'Si',
            selector: row => row.acreditado,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Fecha',
            selector: row => row.fecha,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Nombre',
            selector: row => row.nombre,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.apellido,
            sortable: true,
            searchable: true,
        },
    ];

    return(<>
        <div className="flex w-full">
            <div className="w-6/12">
                <TextField
                    id="search-bar-type"
                    select
                    label="Sede"
                    className="w-full"
                    value={selectedAgendaLocation}
                    onChange={(e) => setSelectedAgendaLocation(e.target.value)}
                    size="small"
                    
                    >
                    {localAgendaLocations.map(location => (
                        <MenuItem key={location.id} value={location}>
                            {location.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>
            <div className="w-6/12">

            <DateTimePicker
                views={['year', 'month']}
                label="Seleccionar fecha"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                />
            </div>
        </div>
        <Table
            columns={columns}
            data={agendaCashValues}
            pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            responsive
        />
    </>);
} 