import React, { useEffect, useState } from "react";
import CommonInput from "../../commonInput";
import Select from "../../select/select";
import Label from "../../label/label";

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
        <div className="flex flex-col gap-4 md:flex-row">
            <div>
                <Label htmlFor="paymentValue">Monto del pago</Label>
                <Select name="paymentValue" className="payment-filter-width" options={typeCriterias} value={typeCriteriaSelected} onChange={setTypeCriteriaSelected}/>
            </div>
            <div className="mt-auto flex flex-col flex-end sm:flex-row">
                {typeCriteriaSelected !== null && 
                    <><CommonInput 
                        label=""
                        currency
                        inputClassName="md:ml-2 payment-filter-width"
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
                    <><span className="mx-2 flex items-center">y</span>
                    <CommonInput 
                        label=""
                        currency
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
    </div>
    );
} 