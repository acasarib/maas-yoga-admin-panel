import React, { useEffect, useState } from "react";
import Select from "react-select";
import dayjs from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

export default function FilterPaymentAt({ onChange }) {

    const [typeCriteriaSelected, setTypeCriteriaSelected] = useState(null);
    const isBetween = typeCriteriaSelected !== null && typeCriteriaSelected.value === "between";
    const [at, setAt] = useState(dayjs(new Date()));
    const [at2, setAt2] = useState(dayjs(new Date()));
    const typeCriterias = [{
        label: "Despues de",
        value: "gte"
    },
    {
        label: "Antes de",
        value: "lte"
    },
    {
        label: "Entre",
        value: "between"
    }];

    useEffect(() => {
        if (typeCriteriaSelected !== null && at !== null && at2 !== null) {
            const isBetween = typeCriteriaSelected.value === "between";
            at.$d.setHours(0);
            at.$d.setMinutes(0);
            at.$d.setSeconds(0);
            at.$d.setMilliseconds(0);
            at2.$d.setHours(23);
            at2.$d.setMinutes(59);
            at2.$d.setSeconds(59);
            at2.$d.setMilliseconds(999);
            onChange(`at ${typeCriteriaSelected.value} ${at.$d.getTime()}${isBetween ? ":" + at2.$d.getTime() : ""}`);
        }
    }, [typeCriteriaSelected, at, at2]);
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2 mt-3">Fecha indicada</span>
        <div className="flex">
            <Select placeholder="Seleccionar" className="payment-filter-width mt-3  mr-8" options={typeCriterias} value={typeCriteriaSelected} onChange={setTypeCriteriaSelected}/>
            <div className="my-auto flex">
                {typeCriteriaSelected !== null && 
                    <>
                        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                            <DateTimePicker
                            label="Seleccionar fecha"
                            value={at}
                            onChange={(newValue) => setAt(newValue)}
                            />
                        </DemoContainer>
                    {typeCriteriaSelected.value === "between" &&
                    <><span className="mx-2">y</span>
                        <DemoContainer components={['DateTimePicker', 'DateTimePicker']}>
                            <DateTimePicker
                            label="Seleccionar fecha"
                            value={at2}
                            onChange={(newValue) => setAt2(newValue)}
                            />
                        </DemoContainer>
                    </>
                    }
                    </>
                }
            </div>
        </div>
    </div>
    );
} 