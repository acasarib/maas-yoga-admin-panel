import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import SearchBar from "./searchBar";
import { TABLE_SEARCH_CRITERIA } from "../../constants";

export default function Table({ serverPaginationData, handleCustomSearchValue, onFilterData = () => {} , defaultSortFieldId, className = "", columns, onChangePage, defaultSearchValue, defaultTypeValue, data, ...rest }) {
    const [searchableColumns, setSearchableColumns] = useState([]);
    const [searchValue, setSearchValue] = useState(defaultSearchValue !== undefined ? defaultSearchValue : "");
    const [typeValue, setTypeValue] = useState(defaultTypeValue !== undefined ? defaultTypeValue : searchableColumns[0]?.name);
    const [dataFiltered, setDataFiltered] = useState(data);

    const getCurrentFilteringColumn = () => columns.filter(column => column.name === typeValue)[0];
    

    useEffect(() => {
        if (searchValue !== "") {
            const currentFilteringColumn = getCurrentFilteringColumn();
            const byAllFields = currentFilteringColumn === undefined;
            if (handleCustomSearchValue != undefined) {
                handleCustomSearchValue({ searchValue, byAllFields, field: currentFilteringColumn?.name })
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
                searchValue={searchValue}
                onChangeSearch={setSearchValue}
                typeValue={typeValue}
                onChangeType={setTypeValue}
                searchableColumns={searchableColumns}
            />}
            <DataTable
                className={`rounded-3xl shadow-lg mt-1 ${className}`}
                columns={columns.filter(col => col.hidden !== true)}
                data={serverPaginationData != undefined ? serverPaginationData : dataFiltered}
                defaultSortFieldId={defaultSortFieldId}
                onChangePage={onChangePage}
                paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: false, selectAllRowsItemText: 'Todo' }}
                {...rest}
            />
        </div>
    );
} 