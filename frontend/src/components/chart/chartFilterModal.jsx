import React, { useState } from "react";
import BalanceIcon from '@mui/icons-material/Balance';
import Modal from "../modal";
import Select from "react-select";
import FilterPaymentType from "./filters/type";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import FilterPaymentValue from "./filters/value";
import FilterPaymentAt from "./filters/at";
import FilterPaymentStudent from "./filters/student";
import FilterPaymentCourse from "./filters/course";
import FilterPaymentCollege from "./filters/college";
import FilterPaymentItem from "./filters/item";
import FilterPaymentCategory from "./filters/category";
import FilterPaymentClazz from "./filters/clazz";

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
            label: "Modo de pago",
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
        {
            label: "Sede",
            value: "headquarterId",
            component: <FilterPaymentCollege onChange={value => onFilterChangeValue(value, "headquarterId")} />
        },
        {
            label: "Rubro",
            value: "item.categoryId",
            component: <FilterPaymentCategory onChange={value => onFilterChangeValue(value, "item.categoryId")} />
        },
        {
            label: "Articulo",
            value: "itemId",
            component: <FilterPaymentItem onChange={value => onFilterChangeValue(value, "itemId")} />
        },
        {
            label: "Clase",
            value: "clazzId",
            component: <FilterPaymentClazz onChange={value => onFilterChangeValue(value, "clazzId")} />
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
        open={isOpen}
        size="large"
        setDisplay={closeModal}
        buttonText={"Aplicar"}
        title="Seleccionar filtros"
        onClick={handleApplyFilter}
    >
        {currentFilters.map(filter => 
            <div key={filter.value} className="flex items-center justify-between mb-4">
                {filter.component}
                <RemoveCircleOutlineIcon className="cursor-pointer" onClick={() => removeFilter(filter)}/>
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