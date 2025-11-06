import React, { useState } from "react";
import BalanceIcon from '@mui/icons-material/Balance';
import Modal from "../modal";
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
import FilterPaymentCreatedAt from "./filters/createdAt";
import FilterPaymentOperativeResult from "./filters/operativeResult";
import Select from "../select/select";
import Label from "../label/label";
import { Tooltip } from "@mui/material";

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
            label: "Fecha indicada",
            value: "at",
            component: <FilterPaymentAt onChange={value => onFilterChangeValue(value, "at")} />
        },
        {
            label: "Fecha ingreso",
            value: "createdAt",
            component: <FilterPaymentCreatedAt onChange={value => onFilterChangeValue(value, "createdAt")} />
        },
        {
            label: "Resultado operativo",
            value: "operativeResult",
            component: <FilterPaymentOperativeResult onChange={value => onFilterChangeValue(value, "operativeResult")} />
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
        <div className={`mb-12 flex flex-col gap-6 ${currentFilters.length === 0 && "hidden"}`}>
            {currentFilters.map((filter, i) => 
                <div key={filter.value} className={`flex items-center justify-between ${i % 2 == 0 && "bg-gray-100 rounded"} p-4`}>
                    {filter.component}
                    <Tooltip title="Quitar filtro">
                        <RemoveCircleOutlineIcon className="cursor-pointer" onClick={() => removeFilter(filter)}/>
                    </Tooltip>
                </div>)}
        </div>
        {filtersAvailable.length > 0 &&
            <>
            <Label htmlFor="filterType">Tipo de filtro</Label>
            <Select name="filterType" placeholder="Seleccionar" className="payment-filter-width" value={null} onChange={onSelectNewFilter} options={filtersAvailable} />
            </>
        }
    </Modal>
    );
} 