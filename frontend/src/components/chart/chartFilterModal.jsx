import React, { useState } from "react";
import BalanceIcon from '@mui/icons-material/Balance';
import Modal from "../modal";
import Select from "react-select";
import FilterPaymentType from "./filters/type";
import CloseIcon from '@mui/icons-material/Close';
import FilterPaymentValue from "./filters/value";
import FilterPaymentAt from "./filters/at";
import FilterPaymentStudent from "./filters/student";
import FilterPaymentCourse from "./filters/course";

export default function ChartFilterModal({ isOpen, closeModal, onApplyFilter }) {

    const onFilterChangeValue = (filterValue, filterType) => {
        setCurrentFilters(oldArray => oldArray.map(filter => {
            if (filter.value === filterType) {
                filter.criteria = filterValue;
            }
            return filter;
        }));
    }
    const [filtersAvailable, setFiltersAvailable] = useState([
        {
            label: "Origen del pago",
            value: "type",
            component: <FilterPaymentType onChange={value => onFilterChangeValue(value, "type")}/>
        },
        {
            label: "Monto del pago",
            value: "value",
            component: <FilterPaymentValue onChange={value => onFilterChangeValue(value, "value")}/>
        },
        {
            label: "Fecha del pago",
            value: "at",
            component: <FilterPaymentAt onChange={value => onFilterChangeValue(value, "at")} />
        },
        {
            label: "Estudiante",
            value: "studentId",
            component: <FilterPaymentStudent onChange={value => onFilterChangeValue(value, "studentId")} />
        },
        {
            label: "Curso",
            value: "courseId",
            component: <FilterPaymentCourse onChange={value => onFilterChangeValue(value, "courseId")} />
        },
    ]);
    const [currentFilters, setCurrentFilters] = useState([]);

    const onSelectNewFilter = (newFilter) => {
        setCurrentFilters(oldArray => [...oldArray, newFilter]);
        setFiltersAvailable(filtersAvailable.filter(filter => filter.value !== newFilter.value))
    }

    const removeFilter = (filter) => {
        filter.criteria = "";
        setCurrentFilters(currentFilters.filter(f => f.value !== filter.value));
        setFiltersAvailable(oldArray => [...oldArray, filter]);
    }

    const handleApplyFilter = () => {
        onApplyFilter(currentFilters.map(filter => filter.criteria));
    }

    return (
    <Modal
        icon={<BalanceIcon />}
        style={{maxWidth: "70%"}}
        open={isOpen}
        setDisplay={closeModal}
        buttonText={"Aplicar"}
        title="Seleccionar filtros"
        onClick={handleApplyFilter}
    >
        {currentFilters.map(filter => 
            <div key={filter.value} className="flex justify-between mb-4">
                {filter.component}
                <CloseIcon className="cursor-pointer" onClick={() => removeFilter(filter)}/>
            </div>)}
        {filtersAvailable.length > 0 &&
            <>
            <label>Tipo de filtro</label>
            <Select placeholder="Seleccionar" className="payment-filter-width" value={null} onChange={onSelectNewFilter} options={filtersAvailable} />
            </>
        }
    </Modal>
    );
} 