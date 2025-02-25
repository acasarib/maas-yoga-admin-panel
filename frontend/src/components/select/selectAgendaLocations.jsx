import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

export default function SelectAgendaLocations({ value, onChange }) {
    const { getAgendaLocations } = useContext(Context);
    const [agendaLocations, setAgendaLocations] = useState([])
    const [localAgendaLocations, setLocalAgendaLocations] = useState([]); 
    const allLocation = { id: 'all', label:"Todas", value: 'all' };

    const fetchAgendaLocations = async () => {
        const locations = await getAgendaLocations()
        setAgendaLocations(locations)
    }

    useEffect(() => {
        fetchAgendaLocations()
    }, [])
    

    useEffect(() => {
        setLocalAgendaLocations([allLocation,...agendaLocations]);
    }, [agendaLocations]);

    useEffect(() => {
        if (localAgendaLocations.length > 0) {
            onChange(localAgendaLocations.filter(l => l.id == 'all')[0]);
        }
    }, [localAgendaLocations]);

    return(
        <TextField
            id="search-bar-type"
            select
            label="Sede"
            className="w-full"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            size=""
            
            >
            {localAgendaLocations.map(location => (
                <MenuItem key={location.id} value={location}>
                    {location.label}
                </MenuItem>
            ))}
        </TextField>
    );
} 