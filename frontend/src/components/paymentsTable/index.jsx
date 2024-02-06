import React, { useEffect, useState, useContext, useMemo } from "react";
import Table from "../table";
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from "../modal";
import { Context } from "../../context/Context";
import { dateToString, withSeparators } from "../../utils";
import Select from 'react-select';
import DoneIcon from '@mui/icons-material/Done';
import { PAYMENT_OPTIONS } from "../../constants";
import EditIcon from '@mui/icons-material/Edit';
import CustomCheckbox from "../checkbox/customCheckbox";
import TableSummary from '../table/summary'

export default function PaymentsTable({ dateField = "at", className = "", payments, isLoading, onDelete = () => {}, canVerify, editPayment, editMode }) {
    const { deletePayment, user, categories, verifyPayment, updatePayment, changeAlertStatusAndMessage, getCourseById } = useContext(Context);
    const [payment, setPayment] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [isDeletingPayment, setIsDeletingPayment] = useState(false);
    const [verifyModal, setVerifyModal] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifingPaymentMethod, setVerifingPaymentMethod] = useState(null);
    const [showDischarges, setShowDischarges] = useState(false);
    const [showIncomes, setShowIncomes] = useState(false);
    const [filteredPayments, setFilteredPayments] = useState([]);

    const getBalanceForAllPayments = () => {
        return payments.reduce((total, payment) => total + payment.value, 0);
    }

    const handleDeletePayment = async () => {
        setIsDeletingPayment(true);
        await deletePayment(payment.id);
        setIsDeletingPayment(false);
        setPayment(null);
        setDeleteModal(false);
        onDelete(payment.id);
    }

    const handleVerifyPayment = async () => {
        setVerifying(true);
        await updatePayment({ type: verifingPaymentMethod.value }, payment.id);
        await verifyPayment(payment.id);
        setVerifying(false);
        setPayment(null);
        setVerifyModal(false);
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

    const getPayments = () => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value >= 0) {
                value = value + payment.value;
            }
        });
        return value;
    }

    const getDischarges = () => {
        let value = 0;
        payments.forEach(payment => {
            if(payment.value < 0) {
                value = value + payment.value;
            }
        });
        return value * -1;
    }

    const openDeleteModal = (payment) => {
        setPayment(payment);
        setDeleteModal(true);
    }

    const openVerifyModal = (payment) => {
        setPayment(payment);
        setVerifingPaymentMethod(PAYMENT_OPTIONS.find(po => po.value === payment.type));
        setVerifyModal(true);
    }

    const getUserFullName = (row) => {
        if (row.user && row.user !== undefined && row.user !== null) {
            return row.user.firstName + ' ' + row.user.lastName;
        } else {
            return "Sistema";
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
        const newColumns = [
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
                cell: row => <span className={`${row.value >= 0 ? "text-gray-800" : "text-red-800"} whitespace-nowrap w-16 font-bold`}>{'$' + withSeparators(row.value)}</span>,
                sortable: true,
                searchable: true,
                selector: row => row.value.toString(),
                //maxWidth: '80px'
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
                name: 'Comprobante',
                cell: row => (<>{(row.fileId !== null || row.driveFileId !== null) &&<a href={row.fileId !== null ? `${process.env.REACT_APP_BACKEND_HOST}api/v1/files/${row.fileId}` : `#`} onClick={() => handleDownloadGoogleDrive(row)} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
                </a>}</>),
                sortable: true,
            },
            {
                name: 'Acciones',
                cell: row => (<div className="flex w-full justify-center"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row)}><DeleteIcon /></button>{canVerify && (<button className="rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1" onClick={() => openVerifyModal(row)}><DoneIcon /></button>)}{editMode && (<button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button>)}</div>),
                sortable: true,
            },
        ];
        return newColumns;
    }, [categories, dateField]); 

    useEffect(() => {
        setFilteredPayments(payments);
    }, [payments]);

    useEffect(() => {
        setFilteredPayments(payments);
    }, [])
    

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
                className={`rounded-3xl shadow-lg ${className}`}
                columns={columns}
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
            <TableSummary total={getBalanceForAllPayments()} incomes={getPayments()} expenses={getDischarges()}/>
            <Modal onClose={() => setPayment(null)} icon={<DeleteIcon />} open={deleteModal} setDisplay={() => setDeleteModal(false)} title="Eliminar pago" buttonText={isDeletingPayment ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeletePayment}>
                {payment !== null &&
                    <div>Esta a punto de eliminar el pago con el importe de <span className="font-bold">{payment.value}$</span>{payment.fileId !== null && ", este pago tiene asociado un comprobante el cual tambien sera eliminado."}</div>
                }
            </Modal>
            <Modal onClose={() => setPayment(null)} icon={<DoneIcon />} open={verifyModal} setDisplay={() => setVerifyModal(false)} title="Verificar pago" buttonText={verifying ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Verificando...</span></>) : <span>Verificar</span>} onClick={handleVerifyPayment}>
                {payment !== null &&
                    <div>
                        <div>Esta a punto de verificar el pago con el importe de <span className="font-bold">{payment.value}$</span></div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</label>
                            <Select value={verifingPaymentMethod} onChange={setVerifingPaymentMethod} options={PAYMENT_OPTIONS} />
                        </div>
                    </div>
                }
            </Modal>
        </>
    );
} 