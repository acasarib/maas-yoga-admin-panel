import React, { useEffect, useState } from "react";
import Select from "react-select";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import 'dayjs/locale/es';

export default function FilterPaymentOperativeResult({ onChange }) {

    const [selectedDate, setSelectedDate] = useState(dayjs(new Date()));

    useEffect(() => {
        if (selectedDate !== null) {
            selectedDate.$d.setMilliseconds(0);
            selectedDate.$d.setSeconds(0);
            selectedDate.$d.setHours(0);
            selectedDate.$d.setMinutes(0);
            selectedDate.$d.setDate(1);
            const to = new Date(selectedDate.valueOf());
            const selectedMonth = to.getMonth();
            to.setMonth(selectedMonth + 1, 1);
            to.setHours(23);
            to.setMinutes(59);
            to.setDate(to.getDate() - 1);
            const startAt = selectedDate.$d.getTime();
            const endAt = to.getTime();
            const condition = `operativeResult between ${startAt}:${endAt}`;
            onChange(condition);
        }
    }, [selectedDate]);
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2 mt-3">Resultado operativo</span>
        <div className="flex">
                <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                    <DateTimePicker
                        views={['year', 'month']}
                        label="Seleccionar fecha"
                        value={selectedDate}
                        onChange={(newValue) => setSelectedDate(newValue)}
                    />
                </DemoContainer>
        </div>
    </div>
    );
} 