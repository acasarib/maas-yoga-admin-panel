import React, { useEffect, useState } from "react";
import Select from "react-select";
import CommonInput from "../../commonInput";

export default function FilterPaymentValue({ onChange }) {

    const [typeCriteriaSelected, setTypeCriteriaSelected] = useState(null);
    const [value, setValue] = useState(0);
    const [value2, setValue2] = useState(0);
    const typeCriterias = [{
        label: "Mayor a",
        value: "gt"
    },
    {
        label: "Mayor o igual a",
        value: "gte"
    },
    {
        label: "Igual a",
        value: "eq"
    },
    {
        label: "Menor a",
        value: "lt"
    },
    {
        label: "Menor o igual a",
        value: "lte"
    },
    {
        label: "Entre",
        value: "between"
    }];

    const handleOnChangeValue = (value) => setValue(value)

    const handleOnChangeValue2 = (value) => setValue2(value);

    useEffect(() => {
        if (typeCriteriaSelected !== null) {
            const isBetween = typeCriteriaSelected.value === "between";
            onChange(`value ${typeCriteriaSelected.value} ${value}${isBetween ? ":" + value2 : ""}`);
        }
    }, [typeCriteriaSelected, value, value2]);

    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Monto del pago</span>
        <div className="flex">
            <Select className="payment-filter-width" options={typeCriterias} value={typeCriteriaSelected} onChange={setTypeCriteriaSelected}/>
            {typeCriteriaSelected !== null && 
                <><CommonInput 
                    label=""
                    inputClassName="ml-2 payment-filter-width"
                    className="hidden"
                    value={value}
                    name="value"
                    htmlFor="value"
                    id="value" 
                    type="number" 
                    placeholder="Valor" 
                    onChange={(e) => handleOnChangeValue(e.target.value)}
                />
                {typeCriteriaSelected.value === "between" &&
                <><span className="mx-2 my-auto">y</span>
                <CommonInput 
                    label=""
                    inputClassName="payment-filter-width"
                    className="hidden"
                    value={value2}
                    name="value"
                    htmlFor="value"
                    id="value" 
                    type="number" 
                    placeholder="Valor" 
                    onChange={(e) => handleOnChangeValue2(e.target.value)}
                /></>
                }
                </>
            }
        </div>
    </div>
    );
} 