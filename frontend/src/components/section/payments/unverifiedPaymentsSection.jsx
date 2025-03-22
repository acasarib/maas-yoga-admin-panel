import React, { useState, useEffect } from "react";
import PaymentsTable from "../../paymentsTable";
import paymentsService from "../../../services/paymentsService";
import { fromDDMMYYYYStringToDate } from "../../../utils";

export default function UnverifiedPaymentsSections({ defaultSearchValue, defaultTypeValue, }) {
    const [resetTable, setResetTable] = useState(false);
    const [pageablePayments, setPageablePayments] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [tableSummary, setTableSummary] = useState(null)

    useEffect(() => {
        if (resetTable)
            setResetTable(false)
    }, [resetTable])

    useEffect(() => {
        fetchPayments();
        setResetTable(true)
    }, []);

    const fetchPayments = async (page = currentPage, size = perPage, searchParams, isOrOperation = false) => {
        setIsLoading(true)
        if (searchParams) {
            if ("at" in searchParams)
                searchParams.at.value = fromDDMMYYYYStringToDate(searchParams.at.value);
            if ('operativeResult' in searchParams)
                searchParams.operativeResult.value = fromDDMMYYYYStringToDate(searchParams.operativeResult.value);
        }
        if (defaultTypeValue) {
            searchParams[defaultTypeValue] = {
                value: defaultSearchValue,
                operation: 'eq'
            }
        }
        const data = await paymentsService.getAllPaymentsUnverified(page, size, searchParams, isOrOperation);        
        setIsLoading(false)
        setPageablePayments(data.data);
        setTotalRows(data.totalItems);
        setTableSummary(data);
    }

    const handleOnSearch = async (searchParams) => {
        let searchBy = searchParams.byAllFields ? 'all' : searchParams.serverProp;
        let searchValue = searchParams.searchValue;
        let searchOperation = searchParams.serverOperation;
        if (searchValue === "") {//Sin filtro
            searchValue = undefined;
            searchBy = undefined;
            fetchPayments(currentPage, perPage, null);
        } else if (!searchParams.byAllFields) {// Un filtro solo
            const params = {
                [searchBy]: {
                    value: searchValue,
                    operation: searchOperation,
                }
            }
            fetchPayments(currentPage, perPage, params, false);
        } else { // Filtro Todos
            const params = { all: searchValue }
            
            fetchPayments(currentPage, perPage, params, true);
        }
         
    }

    const handlePageChange = page => {        
        fetchPayments(page);
        setCurrentPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        fetchPayments(page, newPerPage);
        setPerPage(newPerPage);
    };

    return (<>
        <div className="mb-6 md:my-6 mx-8 md:mx-4">
            <PaymentsTable
                pageableProps={{
                    resetTable,
                    handleCustomSearchValue: handleOnSearch,
                    paginationTotalRows: totalRows,
                    onChangePage: handlePageChange,
                    onChangeRowsPerPage: handlePerRowsChange,
                    paginationDefaultPage: currentPage,
                }}
                summary={tableSummary}
                canVerify                editMode={true}
                payments={pageablePayments}
                isLoading={isLoading}
                defaultSearchValue={defaultSearchValue}
                defaultTypeValue={defaultTypeValue}
            />
        </div>
    </>);
} 