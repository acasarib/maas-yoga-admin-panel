import React, { useEffect, useState, useContext, useMemo } from "react";
import Table from "../table";
import DeleteIcon from '@mui/icons-material/Delete';
import { Context } from "../../context/Context";
import { dateToString, formatPaymentValue } from "../../utils";
import DoneIcon from '@mui/icons-material/Done';
import { TABLE_SEARCH_CRITERIA } from "../../constants";
import EditIcon from '@mui/icons-material/Edit';
import CustomCheckbox from "../checkbox/customCheckbox";
import TableSummary from '../table/summary'
import { Tooltip } from "@mui/material";
import VerifyPaymentModal from "../modal/verifyPaymentModal";
import useModal from "../../hooks/useModal";
import DeletePaymentModal from "../modal/deletePaymentModal";

export default function PaymentsTable({ columnsProps = [],dateField = "at", className = "", payments, defaultSearchValue, defaultTypeValue, isLoading, canVerify, editPayment, editMode, onClickDeletePayment, onClickVerifyPayment }) {
    const { user, categories, changeAlertStatusAndMessage, getCourseById, getUserById } = useContext(Context);
    const [payment, setPayment] = useState(null);
    const verifyPaymentModal = useModal()
    const deletePaymentModal = useModal()
    const [showDischarges, setShowDischarges] = useState(false);
    const [showIncomes, setShowIncomes] = useState(false);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [tableSummary, setTableSummary] = useState({ total: 0, incomes: 0, expenses: 0 })

    const getBalanceForAllPayments = (payments) => {
        return payments.reduce((total, payment) => total + payment.value, 0);
    }

    const openEditModal = (payment) => {
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
        if (typeof onClickDeletePayment == 'function') {
            onClickDeletePayment(payment)
        } else {
            setPayment(payment);
            deletePaymentModal.open()
        }
    }

    const openVerifyModal = (payment) => {
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
            const user = getUserById(row.verifiedBy)
            return user.firstName + ' ' + user.lastName;
        } else {
            return "No verificado"
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
        try {
            let item = "";
            if(row.itemId !== null) {
                try {
                    const newItem = categories.find(category => category.items.find(item => item.id === row.itemId)).items.find(item => item.id === row.itemId);
                    item = newItem.title;
                }catch {
                    item = "";
                }
            }else {
                if((row.student !== null) && (row.courseId !== null)) {
                    const course = getCourseById(row.courseId);
                    if(typeof course !== "undefined")  item = course?.title;
                }else if((row.courseId !== null) && (row.value < 0) && (row.student === null) && (row.professorId !== null)) {
                    const course = getCourseById(row.courseId);
                    if(typeof course !== "undefined")  item = course?.title;
                }
            }
            return item;
        } catch (e) {
            return ""
        }
    }

    const columns = useMemo(() => {
        const defaultColumns = [
            {
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
                selector: row => dateToString(row[dateField]),
                sortable: true,
                searchable: true,
                maxWidth: '120px',
                minWidth: '120px',
            },
            {
                name: 'Importe',
                cell: row => <span className={`${row.value >= 0 ? "text-blue-400" : "text-red-800"} whitespace-nowrap w-16 font-bold`}>{formatPaymentValue(row.value)}</span>,
                sortable: true,
                searchable: true,
                selector: row => row.value.toString(),
            },
            {
                name: 'Modo de pago',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{row.type}</span>,
                sortable: true,
                searchable: true,
                selector: row => row.type,
            },
            {
                name: 'Detalle',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getItemById(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getItemById(row),
            },
            {
                name: 'Abonado por',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getStudentFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getStudentFullName(row),
            },
            {
                name: 'Profesor',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getProfessorFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getProfessorFullName(row),
            },
            {
                name: 'Informado por',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getUserFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getUserFullName(row),
            },
            {
                name: 'Verificado por',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getVerifierUserFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getVerifierUserFullName(row),
            },
            {
                name: 'Comprobante',
                cell: row => (<>{(row.fileId !== null || row.driveFileId !== null) &&<a href={row.fileId !== null ? `${process.env.REACT_APP_BACKEND_HOST}api/v1/files/${row.fileId}` : `#`} onClick={() => handleDownloadGoogleDrive(row)} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
                </a>}</>),
                sortable: true,
            },
            {
                name: 'Acciones',
                cell: row => (<>
                    <div className="flex w-full justify-center">
                        <Tooltip title="Eliminar">
                            <button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row)}>
                                <DeleteIcon />
                            </button>
                        </Tooltip>
                        {canVerify && (
                            <Tooltip title="Verificar">
                                <button className={`rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1 ${row.verified ? "invisible" : ""}`} onClick={() => openVerifyModal(row)}>
                                    <DoneIcon />
                                </button>
                            </Tooltip>)
                        }
                        {editMode && (
                            <Tooltip title="Editar">
                                <button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}>
                                    <EditIcon />
                                </button>
                            </Tooltip>)
                        }
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
    }, [categories, dateField, columnsProps]); 

    useEffect(() => {
        setFilteredPayments(payments);
    }, [payments]);

    useEffect(() => {
        setFilteredPayments(payments);
    }, [])

    const updateTableSummary = payments =>  {
        setTableSummary({
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

    return(
        <>
            <Table
                defaultSearchValue={defaultSearchValue}
                defaultTypeValue={defaultTypeValue}
                className={`rounded-3xl shadow-lg ${className}`}
                columns={columns}
                onFilterData={(newFilteredPayments) => updateTableSummary(newFilteredPayments)}
                data={filteredPayments}
                noDataComponent={isLoading ? 'Verificando pagos...' : 'No hay pagos disponibles'}
                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
            <div className="flex flex-row my-4">
                <CustomCheckbox
                    checked={showDischarges}
                    labelOn="Mostrar egresos"
                    labelOff="Mostrar egresos"
                    className="ml-2"
                    disabled={showIncomes}
                    onChange={() => setShowDischarges(!showDischarges)}
                />
                <CustomCheckbox
                    checked={showIncomes}
                    labelOn="Mostrar ingresos"
                    labelOff="Mostrar ingresos"
                    className="ml-2"
                    disabled={showDischarges}
                    onChange={() => setShowIncomes(!showIncomes)}
                />          
            </div>
            <TableSummary total={tableSummary.total} incomes={tableSummary.incomes} expenses={tableSummary.expenses}/>
            <DeletePaymentModal payment={payment} isOpen={deletePaymentModal.isOpen} onClose={handleOnCloseDeletePaymentModal}/>
            <VerifyPaymentModal payment={payment} isOpen={verifyPaymentModal.isOpen} onClose={handleOnCloseVerifyPaymentModal}/>
        </>
    );
} 