import React, { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import SearchBar from "./searchBar";
import { TABLE_SEARCH_CRITERIA } from "../../constants";
import NoDataComponent from "./noDataComponent";
import MenuBookIcon from '@mui/icons-material/MenuBook';
import Loader from "../spinner/loader";

export default function Table({ serverPaginationData, handleCustomSearchValue, onFilterData = () => {} , defaultSortFieldId, className = "", columns, onChangePage, defaultSearchValue, defaultTypeValue, data, ...rest }) {
    const [searchableColumns, setSearchableColumns] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultSearchValue !== undefined ? defaultSearchValue : "");
    const [typeValue, setTypeValue] = useState(defaultTypeValue !== undefined ? defaultTypeValue : searchableColumns[0]?.name);
    const [dataFiltered, setDataFiltered] = useState(data);
    const [isSearching, setIsSearching] = useState(false);
    const effectCalls = useRef(0)

    const getCurrentFilteringColumn = () => columns.filter(column => column.name === typeValue)[0];
    
    const handleSearchChange = (value) => {
        setIsSearching(true);
        setSearchValue(value);
        // Simular un pequeño delay para mostrar el loader
        setTimeout(() => {
            setIsSearching(false);
        }, 300);
    };
    

    useEffect(() => {
        if (searchValue !== "") {
            
            const currentFilteringColumn = getCurrentFilteringColumn();
            const byAllFields = currentFilteringColumn === undefined;
            if (handleCustomSearchValue != undefined) {
                handleCustomSearchValue({ searchValue, byAllFields, field: currentFilteringColumn?.name, serverProp: currentFilteringColumn?.serverProp, serverOperation: currentFilteringColumn?.serverOperation || 'eq', columns })
                return
            }
            if (byAllFields) {
                setDataFiltered(data.filter(d => {
                    const fields = searchableColumns.map(column => "selector" in column ? column.selector(d) : null);
                    return fields.some(value => {
                        if (value == null || value === undefined || value === '' || typeof value !== 'string' )
                            return false;

                        return value.toLowerCase().includes(searchValue.toLowerCase());
                    });
                }));
            } else {
                const columnSelector = currentFilteringColumn.selector;
                const searchCriteria = currentFilteringColumn.searchCriteria !== undefined ? currentFilteringColumn.searchCriteria : TABLE_SEARCH_CRITERIA.CONTAINS
                if (typeof columnSelector !== "function")
                    throw Error(`The column ${currentFilteringColumn.name} has no selector defined`);
                setDataFiltered(data.filter(d => {
                    let dataValue = columnSelector(d);
                    if (typeof dataValue === 'number') {
                        dataValue = ""+dataValue;
                    }
                    if (dataValue === null || dataValue === undefined) {
                        return false;
                    }
                
                    if (typeof dataValue !== 'string') {
                        dataValue = String(dataValue);
                    }
                    
                    switch (searchCriteria) {
                        case TABLE_SEARCH_CRITERIA.CONTAINS:
                            return dataValue?.toLowerCase().includes(searchValue.toLowerCase())
                        case TABLE_SEARCH_CRITERIA.EQUAL: 
                            return dataValue === searchValue
                        default:
                            return dataValue?.toLowerCase().includes(searchValue.toLowerCase())
                    }
                }));
            }
        } else {
            if (handleCustomSearchValue != undefined) {
                if (effectCalls.current > 1) {
                    const currentFilteringColumn = getCurrentFilteringColumn();
                    const byAllFields = currentFilteringColumn === undefined;
                    handleCustomSearchValue({ searchValue: '', byAllFields, field: currentFilteringColumn?.name, serverProp: currentFilteringColumn?.serverProp, serverOperation: currentFilteringColumn?.serverOperation || 'eq', columns })
                } else {
                    effectCalls.current++ 
                }
                return
            }
            setDataFiltered(data);
        }
    }, [data, searchValue, typeValue, searchableColumns]);

    useEffect(() => {  
        const searchableColumns = columns.filter(column => "searchable" in column && column.searchable);
        searchableColumns.unshift({ name: "Todo", searchable: true });
        setSearchableColumns(searchableColumns);
        setTypeValue(defaultTypeValue !== undefined ? defaultTypeValue : "Todo")
    }, [columns]);

    useEffect(() => onFilterData(dataFiltered), [dataFiltered]);
    
    return(
        <div>
            {searchableColumns.length > 0 && <SearchBar
                className="mb-4"
                searchValue={searchValue}
                onChangeSearch={handleSearchChange}
                typeValue={typeValue}
                onChangeType={setTypeValue}
                searchableColumns={searchableColumns}
                isLoading={isSearching}
            />}
            <DataTable
                className={`rounded-3xl shadow-lg mt-1 ${className}`}
                progressComponent={rest.progressComponent || <Loader className="py-32 flex items-center" size={16} />}
                columns={columns.filter(col => col.hidden !== true)}
                data={serverPaginationData != undefined ? serverPaginationData : dataFiltered}
                defaultSortFieldId={defaultSortFieldId}
                noDataComponent={rest.noDataComponent || <NoDataComponent Icon={MenuBookIcon} title="No hay datos" subtitle="No hay datos disponibles"/>}
                onChangePage={onChangePage}
                paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: false, selectAllRowsItemText: 'Todo' }}
                {...rest}
            />
        </div>
    );
} 