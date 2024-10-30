import React from "react";
import ReactSelect from 'react-select';

export default function Select(params) {

    return <ReactSelect {...params} placeholder={params.placeholder ?? "Seleccionar"} />
} 