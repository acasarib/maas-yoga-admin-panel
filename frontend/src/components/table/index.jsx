import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import SearchBar from "./searchBar";

export default function Table({ className = "", columns, data, ...rest }) {
    const [searchableColumns, setSearchableColumns] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [typeValue, setTypeValue] = useState(searchableColumns[0]?.name);
    const [dataFiltered, setDataFiltered] = useState(data);

    const getCurrentFilteringColumn = () => columns.filter(column => column.name === typeValue)[0];

    useEffect(() => {
        if (searchValue !== "") {
            const currentFilteringColumn = getCurrentFilteringColumn();
            const byAllFields = currentFilteringColumn === undefined;
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
                if (typeof columnSelector !== "function")
                    throw Error(`The column ${currentFilteringColumn.name} has no selector defined`);
                setDataFiltered(data.filter(d => {
                    const dataValue = columnSelector(d);
                    if (dataValue === null)
                        return false;
                    return dataValue.toLowerCase().includes(searchValue.toLowerCase());
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
        setTypeValue("Todo")
    }, [columns]);
    
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
                columns={columns}
                data={dataFiltered}
                paginationComponentOptions={{ rowsPerPageText: 'Filas por pagina:', rangeSeparatorText: 'de', noRowsPerPage: false, selectAllRowsItem: false, selectAllRowsItemText: 'Todo' }}
                {...rest}
            />
        </div>
    );
} 