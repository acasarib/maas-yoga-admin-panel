import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import DateTimeInput from '../../calendar/dateTimeInput';
import 'dayjs/locale/es';
import Label from "../../label/label";

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
        <Label htmlFor="operativeResult">Resultado operativo</Label>
        <div className="flex mt-4">
                <DateTimeInput
                    views={['year', 'month']}
                    name="operativeResult"
                    label="Seleccionar fecha"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                />
        </div>
    </div>
    );
} 