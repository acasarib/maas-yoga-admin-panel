import React, { useEffect, useState, useMemo } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { dateToString } from "../../../utils";
import Table from "../../table";
import { LOG_PAYMENT_ACTIONS } from "../../../constants";
import logsService from "../../../services/logsService";
import Loader from "../../spinner/loader";
import NoDataComponent from "../../table/noDataComponent";
import PaidIcon from '@mui/icons-material/Paid';

export default function LogsPaymentSection(props) {
    const [pageableLogs, setPageableLogs] = useState([]);
    const [resetTable, setResetTable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    useEffect(() => {
        if (resetTable)
            setResetTable(false)
    }, [resetTable])

    const getPrettyLogAction = (action, paymentId) => {
        const payment = paymentId !== null ? paymentId : "(pago eliminado)";
        switch (action) {
            case LOG_PAYMENT_ACTIONS.CREATE:
                return `Creacion del pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.UPDATE:
                return `Se modifico el pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.VERIFICATION:
                return `Se verifico el pago #${payment}`;
            case LOG_PAYMENT_ACTIONS.DELETE:
                return `Se elimino un pago`;
            default:
                return 'Error';
        }
    }
    
    const columns = useMemo(() => {
        const newColumns = [
            {
                serverProp: 'date',
                name: 'Fecha',
                selector: row => dateToString(row.createdAt),
                sortable: true,
                searchable: true,
            },
            {
                name: 'Accion',
                cell: row => getPrettyLogAction(row.action, row.paymentId),
                sortable: true,
            },
            {
                serverProp: 'userFullName',
                name: 'Usuario',
                cell: row => row?.user?.firstName + " " + row?.user?.lastName,
                sortable: true,
                searchable: true,
            },
        ];
        return newColumns;
    }, []); 

    useEffect(() => {
        fetchLogs();
        setResetTable(true)
    }, []);


    const fetchLogs = async (page = currentPage, size = perPage, searchField, searchValue) => {
        setIsLoading(true)
        const data = await logsService.getAll(page, size, searchField, searchValue);        
        setIsLoading(false)
        setPageableLogs(data.data);
        setTotalRows(data.totalItems);        
    }

    const handleOnSearch = async (searchParams) => {
        let searchBy = searchParams.byAllFields ? 'search' : searchParams.serverProp;
        let searchValue = searchParams.searchValue;
        if (searchValue === "") {
            searchValue = undefined;
            searchBy = undefined;
        };
        fetchLogs(currentPage, perPage, searchBy, searchValue);
    }

    const handlePageChange = page => {        
        fetchLogs(page);
        setCurrentPage(page);
    };

    const handlePerRowsChange = async (newPerPage, page) => {
        fetchLogs(page, newPerPage);
        setPerPage(newPerPage);
    };

    return (
        <>
        <div>
            <Table
                resetTable={resetTable}
                handleCustomSearchValue={handleOnSearch}
                columns={columns}
                serverPaginationData={pageableLogs}
                paginationServer
                noDataComponent={<NoDataComponent Icon={PaidIcon} title="No hay registros" subtitle="No hay registros de pagos recientes"/>}
                progressPending={isLoading}
                paginationTotalRows={totalRows}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                paginationDefaultPage={currentPage}
                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
        </div>
        </>
    );
} 