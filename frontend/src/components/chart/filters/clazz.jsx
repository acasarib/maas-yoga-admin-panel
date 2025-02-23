import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";
import SelectClass from "../../select/selectClass";

export default function FilterPaymentClazz({ onChange }) {

    const { getClazzes } = useContext(Context); 
    const [selectedClazz, setSelectedClazz] = useState(null);
    const [clazzes, setClazzes] = useState([]);
    
    useEffect(() => {
        if (selectedClazz !== null)
            onChange(`clazzId eq ${selectedClazz.id}`);
    }, [selectedClazz]);

    const fetchClazzes = async () => {
        const clazzes = await getClazzes();
        setClazzes(clazzes);
    };

    useEffect(() => {
        fetchClazzes();
    }, []);
    

    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Clase</span>
        <div className="flex">
            <SelectClass
                className="payment-filter-width"
                value={selectedClazz}
                onChange={setSelectedClazz}
            />
        </div>
    </div>
    );
} 