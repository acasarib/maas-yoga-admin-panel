import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import SearchBar from "./searchBar";

export default function Table({ className = "", columns, data, ...rest }) {
    const searchableColumns = columns.filter(column => "searchable" in column && column.searchable);
    const [searchValue, setSearchValue] = useState("");
    const [typeValue, setTypeValue] = useState(searchableColumns[0]?.name);
    const [dataFiltered, setDataFiltered] = useState(data);

    const getCurrentFilteringColumn = () => columns.filter(column => column.name === typeValue)[0];

    useEffect(() => {
        if (searchValue !== "") {
            const currentFilteringColumn = getCurrentFilteringColumn();
            const columnSelector = currentFilteringColumn.selector;
            if (typeof columnSelector !== "function")
                throw Error(`The column ${currentFilteringColumn.name} has no selector defined`);
            setDataFiltered(data.filter(d => {
                const dataValue = columnSelector(d);
                return dataValue.toLowerCase().includes(searchValue.toLowerCase());
            }));
        } else {
            setDataFiltered(data);
        }
    }, [data, searchValue, typeValue]);
    
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
                className={`rounded-3xl shadow-lg ${className}`}
                columns={columns}
                data={dataFiltered}
                paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: false, selectAllRowsItemText: 'Todo' }}
                {...rest}
            />
        </div>
    );
} 