import React, { useEffect, useState } from "react";
import dayjs from 'dayjs';
import DateTimeInput from '../../calendar/dateTimeInput';
import Select from "../../select/select";
import Label from "../../label/label";

export default function FilterPaymentCreatedAt({ onChange }) {

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
            onChange(`createdAt ${typeCriteriaSelected.value} ${at.$d.getTime()}${isBetween ? ":" + at2.$d.getTime() : ""}`);
        }
    }, [typeCriteriaSelected, at, at2]);
    


    return (
    <div>
        <div className="flex flex-col gap-4 md:flex-row">
            <div>
                <Label htmlFor="createdAt">Fecha ingreso</Label>
                <Select name="createdAt" placeholder="Seleccionar" className="payment-filter-width mr-2" options={typeCriterias} value={typeCriteriaSelected} onChange={setTypeCriteriaSelected}/>
            </div>
            <div className="my-auto flex flex-col sm:flex-row">
                {typeCriteriaSelected !== null && 
                    <>
                        <DateTimeInput
                            label={typeCriteriaSelected.value === "between" ? "Fecha inicio" : typeCriteriaSelected.label}
                            value={at}
                            onChange={(newValue) => setAt(newValue)}
                        />
                    {typeCriteriaSelected.value === "between" &&
                    <><div className="flex flex-col flex-end"><span className="h-38px mx-2 flex h-16 items-center">y</span></div>
                        <DateTimeInput
                            label={typeCriteriaSelected.value === "between" ? "Fecha fin" : typeCriteriaSelected.label}
                            value={at2}
                            onChange={(newValue) => setAt2(newValue)}
                        />
                    </>
                    }
                    </>
                }
            </div>
        </div>
    </div>
    );
} 