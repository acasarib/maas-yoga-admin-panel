import React, { useEffect, useState, useContext, useMemo, useCallback } from "react";
import Table from "../table";
import { Context } from "../../context/Context";
import { dateToString, formatPaymentValue } from "../../utils";
import { TABLE_SEARCH_CRITERIA, INVOICEABLE_PAYMENT_TYPES } from "../../constants";
import CustomCheckbox from "../checkbox/customCheckbox";
import PaidIcon from '@mui/icons-material/Paid';
import TableSummary from '../table/summary'
import VerifyPaymentModal from "../modal/verifyPaymentModal";
import useModal from "../../hooks/useModal";
import DeletePaymentModal from "../modal/deletePaymentModal";
import DeleteButton from "../button/deleteButton";
import EditButton from "../button/editButton";
import VerifyButton from "../button/verifyButton";
import NoDataComponent from "../table/noDataComponent";
import DownloadButton from "../button/downloadButton";
import InvoiceButton from "../button/invoiceButton";
import EmitirFacturaModal from "../modal/emitirFacturaModal";


export default function PaymentsTable({ tableFooter, summary = null, pageableProps = null, columnsProps = [], dateField = "at", className = "",
    payments, defaultSearchValue, defaultTypeValue, isLoading, canVerify, editPayment, editMode, onClickDeletePayment, showInvoiceButton = false,
    onClickVerifyPayment, onSwitchDischarges = () => console.log("no implementado"), onSwitchIncomes = () => console.log("no implementado") }) {
    const { user, changeAlertStatusAndMessage, getUserById, isAuditor } = useContext(Context);
    const [payment, setPayment] = useState(null);
    const [invoicePayments, setInvoicePayments] = useState([]);
    // Selección de facturación indexada por id: persiste entre cambios de página (paginación server-side),
    // a diferencia del estado interno de selección de react-data-table-component, que se resetea cuando
    // cambia el array `data` (ver selectableRowSelected más abajo para el patrón de selección controlada).
    const [selectedPaymentsById, setSelectedPaymentsById] = useState({});
    const [clearSelectedRowsToggle, setClearSelectedRowsToggle] = useState(false);
    const verifyPaymentModal = useModal()
    const deletePaymentModal = useModal()
    const invoiceModal = useModal()
    const [showDischarges, setShowDischarges] = useState(false);
    const [showIncomes, setShowIncomes] = useState(false);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [showOpResultDate, setShowOpResultDate] = useState(false);
    const [tableSummary, setTableSummary] = useState({ total: 0, incomes: 0, expenses: 0 })

    const isInvoiceable = (row) => INVOICEABLE_PAYMENT_TYPES.includes(row.type) && !!(row.studentId || row.student?.id);

    const openInvoiceModal = (payments) => {
        if (isAuditor()) {
            changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden emitir facturas');
            return;
        }
        setInvoicePayments(payments);
        invoiceModal.open();
    }

    const handleInvoiceSuccess = () => {
        setSelectedPaymentsById({});
        setClearSelectedRowsToggle((prev) => !prev);
    }

    const handleSelectedRowsChange = ({ selectedRows }) => {
        // Debe coincidir exactamente con lo que se le pasa como `data`/`serverPaginationData` a la tabla,
        // si no, filas ocultas por otro filtro (ej. discharges/incomes) se sacarían de la selección por error.
        const currentTableData = pageableProps != null ? payments : filteredPayments;
        const selectedIdsOnPage = new Set(selectedRows.map((row) => row.id));
        setSelectedPaymentsById((prev) => {
            const next = { ...prev };
            // Solo tocamos filas presentes en la página/vista actual: si una fila se destildó, la sacamos;
            // el resto de la selección (de otras páginas) queda intacta.
            currentTableData.forEach((row) => {
                if (!selectedIdsOnPage.has(row.id)) delete next[row.id];
            });
            selectedRows.forEach((row) => { next[row.id] = row; });
            // react-data-table-component vuelve a llamar a onSelectedRowsChange cada vez que
            // `selectableRowSelected` cambia de referencia, aunque el contenido no haya cambiado.
            // Si devolvemos un objeto nuevo en esos casos, `selectedPaymentsById` cambia de referencia,
            // `selectableRowSelected` se recalcula (memoizado más abajo) y la librería dispara el ciclo
            // de nuevo → loop infinito de selección parpadeando. Cortamos el ciclo devolviendo la MISMA
            // referencia cuando el conjunto de ids seleccionados no cambió.
            const prevIds = Object.keys(prev);
            const nextIds = Object.keys(next);
            const unchanged = prevIds.length === nextIds.length && nextIds.every((id) => id in prev);
            return unchanged ? prev : next;
        });
    }

    const selectableRowSelected = useCallback((row) => !!selectedPaymentsById[row.id], [selectedPaymentsById]);

    const getBalanceForAllPayments = (payments) => {
        return payments.reduce((total, payment) => total + payment.value, 0);
    }

    const openEditModal = (payment) => {
        if (isAuditor()) {
            changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden editar pagos');
            return;
        }
        editPayment(payment);
    }

    const handleDownloadGoogleDrive = async payment => {
        if (payment.driveFileId) {
            if (!("googleDriveCredentials" in user)) {
                changeAlertStatusAndMessage(true, "error", "El usuario no tiene acceso a google drive");
                return;
            }
            let anchor = document.createElement("a");
            document.body.appendChild(anchor);
            let downloadUrl = `https://www.googleapis.com/drive/v3/files/${payment.driveFileId}`;
            let accessToken = user.googleDriveCredentials.token;
            let authorization = `Bearer ${accessToken}`;
            let headers = new Headers();
            headers.append('Authorization', authorization);
            let response = await fetch(downloadUrl, {
                "method": "GET",
                "headers": {
                    "Authorization": authorization
                }
            });
            let json = await response.json();
            response = await fetch(downloadUrl + "?alt=media", { headers });
            let blobby = await response.blob();
            let objectUrl = window.URL.createObjectURL(blobby);
            anchor.href = objectUrl;
            anchor.download = json.name;
            anchor.click();
            window.URL.revokeObjectURL(objectUrl);
        }
    }

    const getPayments = (payments) => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value >= 0) {
                value = value + payment.value;
            }
        });
        return value;
    }

    const getDischarges = (payments) => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value < 0) {
                value = value + payment.value;
            }
        });
        return value * -1;
    }

    const openDeleteModal = (payment) => {
        if (isAuditor()) {
            changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden eliminar pagos');
            return;
        }
        if (typeof onClickDeletePayment == 'function') {
            onClickDeletePayment(payment)
        } else {
            setPayment(payment);
            deletePaymentModal.open()
        }
    }

    const openVerifyModal = (payment) => {
        if (isAuditor()) {
            changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden verificar pagos');
            return;
        }
        if (typeof onClickVerifyPayment == 'function') {
            onClickVerifyPayment(payment)
        } else {
            setPayment(payment);
            verifyPaymentModal.open()
        }
    }

    const handleOnCloseVerifyPaymentModal = () => {
        setPayment(null);
        verifyPaymentModal.close();
    }

    const handleOnCloseDeletePaymentModal = () => {
        setPayment(null);
        deletePaymentModal.close();
    }

    const getVerifierUserFullName = (row) => {
        if (row.verifiedBy && row.verifiedBy !== undefined && row.verifiedBy !== null) {
            const user = row.verifiedByUser
            return user.firstName + ' ' + user.lastName;
        } else {
            return row.verified ? "Verificado" : "No verificado"
        }
    }

    const getUserFullName = (row) => {
        let user = null
        if (row.user && row.user !== undefined && row.user !== null) {
            user = row.user
        } else if ("userId" in row)  {
            user = getUserById(row.userId)
        }
        if (user) {
            return user.firstName + ' ' + user.lastName;
        } else {
            return "Sistema"
        }
    }

    const getStudentFullName = (row) => {
        if(row.student !== null){
            return row?.student?.name + ' ' + row?.student?.lastName;
        }else {
            if (row.user?.firstName) {
                return row.user.firstName + ' ' + row.user.lastName;
            } else {
                return "Sistema";
            }
        }
    }
    
    const getProfessorFullName = (row) => row.professor !== null ? row?.professor?.name + ' ' + row?.professor?.lastName : "";

    const getItemById = (row) => {
        let item = "";
        try {
            if(row.itemId !== null) {
                item = row.item.title
            }else {
                if((row.student !== null) && (row.courseId !== null)) {
                    const course = row?.course
                    if(typeof course !== "undefined")  item = course?.title;
                }else if((row.courseId !== null) && (row.value < 0) && (row.student === null) && (row.professorId !== null)) {
                    const course = row.course;
                    if(typeof course !== "undefined")  item = course?.title;
                }
            }
            return item;
        } catch (e) {
            return item;
        }
    }

    const dateSortFunction = (rowA, rowB) => {
        const dateA = new Date(rowA[dateField]);
        const dateB = new Date(rowB[dateField]);
        return dateB - dateA;
    };

    const valueSortFunction = (rowA, rowB) => {
        // Convertir a números para asegurar ordenamiento numérico
        const valueA = parseFloat(rowA.value);
        const valueB = parseFloat(rowB.value);
        return valueB - valueA;
    };

    const columns = useMemo(() => {
        const defaultColumns = [
            {
                serverProp: "id",
                serverOperation: 'eq',
                name: 'Identificador',
                searchCriteria: TABLE_SEARCH_CRITERIA.EQUAL,
                hidden: true,
                selector: row => row.id,
                sortable: true,
                searchable: true,
                cell: () => <></>,
            },
            {
                name: 'Fecha',
                serverProp: showOpResultDate ? 'operativeResult' : 'at',
                selector: row => showOpResultDate ? dateToString(row['operativeResult']) : dateToString(row['at']),
                cell: row => <span>{showOpResultDate ? dateToString(row['operativeResult']) : dateToString(row['at'])}</span>,
                sortable: true,
                searchable: true,
                maxWidth: '120px',
                minWidth: '120px',
                sortFunction: dateSortFunction
            },
            {
                serverProp: 'value',
                serverOperation: 'like',
                name: 'Importe',
                cell: row => <span className={`${row.value >= 0 ? "text-blue-400" : "text-red-800"} whitespace-nowrap w-16 font-bold`}>{formatPaymentValue(row.value)}{row.discount && <span className="ml-1">{`(-${row.discount}%)`}</span>}</span>,
                sortable: true,
                searchable: true,
                selector: row => row.value,
                sortFunction: valueSortFunction,
                minWidth: '120px',
            },
            {
                serverProp: 'type',
                serverOperation: 'iLike',
                name: 'Modo de pago',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{row.type}</span>,
                sortable: true,
                searchable: true,
                selector: row => row.type,
            },
            {
                name: 'Detalle',
                serverProp: 'note',
                serverOperation: 'iLike',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getItemById(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getItemById(row),
            },
            {
                name: 'Abonado por',
                serverProp: 'student.name',
                serverOperation: 'iLike',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getStudentFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getStudentFullName(row),
            },
            {
                name: 'Profesor',
                serverProp: 'professor.name',
                serverOperation: 'iLike',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getProfessorFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getProfessorFullName(row),
            },
            {
                name: 'Informado por',
                serverProp: 'user.firstName',
                serverOperation: 'iLike',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getUserFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getUserFullName(row),
            },
            {
                name: 'Verificado por',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getVerifierUserFullName(row)}</span>,
                sortable: true,
                searchable: false,
                selector: row => getVerifierUserFullName(row),
            },
            {
                name: 'Acciones',
                cell: row => (<>
                    <div className="flex w-full justify-center">
                        {(row.fileId !== null || row.driveFileId !== null) &&<a href={row.fileId !== null ? `${process.env.REACT_APP_BACKEND_HOST}api/v1/files/${row.fileId}` : `#`} onClick={() => handleDownloadGoogleDrive(row)}><DownloadButton /></a>}
                        {!isAuditor() && <DeleteButton onClick={() => openDeleteModal(row)} />}
                        {canVerify && !isAuditor() && (<VerifyButton invisible={row.verified} onClick={() => openVerifyModal(row)} />)
                        }
                        {editMode && !isAuditor() && (<EditButton onClick={() => openEditModal(row)}/>)
                        }
                        {showInvoiceButton && !isAuditor() && (
                            <InvoiceButton
                                className={isInvoiceable(row) ? '' : 'invisible pointer-events-none'}
                                onClick={() => openInvoiceModal([row])}
                            />
                        )}
                    </div></>),
                sortable: true,
            },
        ];
        const columns = []
        const columnsPropsNames = columnsProps.map(col => col.name)
        defaultColumns.forEach(col => {
            if (columnsPropsNames.includes(col.name)) {
                const colProp = columnsProps.find(c => c.name === col.name)
                if (!colProp.hidden) {
                    columns.push(col)
                }
            } else {
                columns.push(col)
            }
        })
        return columns;
    }, [dateField, showOpResultDate]); 

    useEffect(() => {
        setFilteredPayments(payments);
    }, [payments]);

    useEffect(() => {
        setFilteredPayments(payments);
    }, [])

    const updateTableSummary = (payments = []) =>  {
        setTableSummary({// Si quien invoca el componente no pasa el parametro 'summary' entonces se calcula con el array de pagos
            total: getBalanceForAllPayments(payments),
            incomes: getPayments(payments),
            expenses: getDischarges(payments),
        })
    }

    useEffect(() => updateTableSummary(filteredPayments), [filteredPayments])

    useEffect(() => {
        if(showDischarges) {
            const discharges = payments.filter(payment => payment.value < 0);
            setFilteredPayments(discharges);
        }else {
            setFilteredPayments(payments);
        }
    }, [showDischarges])

    useEffect(() => {
        if(showIncomes) {
            const incomes = payments.filter(payment => payment.value >= 0);
            setFilteredPayments(incomes);
        }else {
            setFilteredPayments(payments);
        }
    }, [showIncomes])

    let tableProps = {
        className: `rounded-3xl shadow-lg ${className}`,
        columns: columns,
        paginationRowsPerPageOptions: [5, 10, 25, 50, 100],
        progressPending: isLoading,
        noDataComponent: <NoDataComponent Icon={PaidIcon} title="No hay pagos" subtitle="No se encontraron pagos con el criterio seleccionado" />,
        pagination: true,
    }

    if (showInvoiceButton) {
        tableProps = {
            ...tableProps,
            selectableRows: true,
            selectableRowDisabled: (row) => !isInvoiceable(row),
            selectableRowSelected,
            onSelectedRowsChange: handleSelectedRowsChange,
            clearSelectedRows: clearSelectedRowsToggle,
            // Sin esto, react-data-table-component limpia su selección interna apenas se hace click
            // en "página siguiente" (dispatch CHANGE_PAGE), ANTES de que lleguen los datos de la nueva
            // página — eso hacía que handleSelectedRowsChange interpretara la limpieza prematura como
            // "se destildó todo en la página actual" y borrara la selección persistida por error.
            paginationServerOptions: { persistSelectedOnPageChange: true },
        }
    }

    if (pageableProps != null) {
        tableProps = {
            ...tableProps,
            ...pageableProps,
            serverPaginationData: payments,
            paginationServer: true,
        }
    } else {
        tableProps = {
            ...tableProps,
            onFilterData: (newFilteredPayments) => updateTableSummary(newFilteredPayments),
            data: filteredPayments,
            defaultSearchValue: defaultSearchValue,
            defaultTypeValue: defaultTypeValue,
        }
    }
    
    const selectedPayments = Object.values(selectedPaymentsById);

    return(
        <>
            <Table {...tableProps} />
            {showInvoiceButton && selectedPayments.length > 0 && !isAuditor() && (
                <div className="flex justify-end my-2">
                    <button
                        onClick={() => openInvoiceModal(selectedPayments)}
                        className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded px-3 py-2 text-sm transition-colors"
                    >
                        Emitir factura AFIP ({selectedPayments.length})
                    </button>
                </div>
            )}
            <div className="flex flex-col sm:flex-row my-4">
                <CustomCheckbox
                    checked={showDischarges}
                    labelOn="Mostrar egresos"
                    labelOff="Mostrar egresos"
                    disabled={showIncomes}
                    onChange={() => {onSwitchIncomes(!showDischarges);setShowDischarges(!showDischarges)}}
                />
                <CustomCheckbox
                    checked={showIncomes}
                    labelOn="Mostrar ingresos"
                    labelOff="Mostrar ingresos"
                    className="sm:ml-2"
                    disabled={showDischarges}
                    onChange={() => {onSwitchDischarges(!showIncomes);setShowIncomes(!showIncomes)}}
                />      
                <CustomCheckbox
                    checked={showOpResultDate}
                    labelOn="Motrar fecha operativa"
                    labelOff="Mostrar fecha operativa"
                    className="sm:ml-2"
                    onChange={() => setShowOpResultDate(!showOpResultDate)}
                /> 
                {tableFooter}
            </div>
            <TableSummary total={summary != null ? summary.total : tableSummary.total} incomes={summary != null ? summary.incomes : tableSummary.incomes} expenses={summary != null ? summary.expenses : tableSummary.expenses}/>
            <DeletePaymentModal payment={payment} isOpen={deletePaymentModal.isOpen} onClose={handleOnCloseDeletePaymentModal}/>
            <VerifyPaymentModal payment={payment} isOpen={verifyPaymentModal.isOpen} onClose={handleOnCloseVerifyPaymentModal}/>
            <EmitirFacturaModal payments={invoicePayments} isOpen={invoiceModal.isOpen} onClose={invoiceModal.close} onSuccess={handleInvoiceSuccess} />
        </>
    );
} 