import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";

export default function FilterPaymentAt({ onChange }) {

    const [typeCriteriaSelected, setTypeCriteriaSelected] = useState(null);
    const isBetween = typeCriteriaSelected !== null && typeCriteriaSelected.value === "between";
    const [at, setAt] = useState(new Date());
    const [at2, setAt2] = useState(new Date());
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
            at.setHours(0);
            at.setMinutes(0);
            at2.setHours(23);
            at2.setMinutes(59);
            onChange(`at ${typeCriteriaSelected.value} ${at.getTime()}${isBetween ? ":" + at2.getTime() : ""}`);
        }
    }, [typeCriteriaSelected, at, at2]);
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Fecha del pago</span>
        <div className="flex">
            <Select placeholder="Seleccionar" className="payment-filter-width" options={typeCriterias} value={typeCriteriaSelected} onChange={setTypeCriteriaSelected}/>
            <div className="my-auto flex">
                {typeCriteriaSelected !== null && 
                    <>
                    <DatePicker
                        className="ml-2"
                        selected={at}
                        onChange={setAt}
                        selectsStart={isBetween}
                        startDate={isBetween ? at : null}
                        endDate={isBetween ? at2 : null}
                    />
                    {typeCriteriaSelected.value === "between" &&
                    <><span className="mx-2">y</span>
                    <DatePicker
                        selected={at2}
                        onChange={setAt2}
                        selectsEnd
                        startDate={at}
                        endDate={at2}
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