import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import DateTimeInput from '../../calendar/dateTimeInput';
import 'dayjs/locale/es';
import Label from "../../label/label";
import DateInput from "../../calendar/dateInput";

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
        <DateInput
            views={['year', 'month']}
            name="operativeResult"
            label="Resultado operativo"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
        />
    </div>
    );
} 