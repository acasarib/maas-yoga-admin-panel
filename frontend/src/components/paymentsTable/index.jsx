import React, { useEffect, useState, useContext, useMemo } from "react";
import Table from "../table";
import DeleteIcon from '@mui/icons-material/Delete';
import Modal from "../modal";
import { Context } from "../../context/Context";
import { dateToString, withSeparators } from "../../utils";
import Select from 'react-select';
import DoneIcon from '@mui/icons-material/Done';
import { PAYMENT_OPTIONS } from "../../constants";

export default function PaymentsTable({ className = "", payments, isLoading, onDelete = () => {}, canVerify }) {
    const { deletePayment, categories, verifyPayment, updateUnverifiedPayment } = useContext(Context);
    const [payment, setPayment] = useState(null);
    const [deleteModal, setDeleteModal] = useState(false);
    const [isDeletingPayment, setIsDeletingPayment] = useState(false);
    const [verifyModal, setVerifyModal] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verifingPaymentMethod, setVerifingPaymentMethod] = useState(null);

    const getBalanceForAllPayments = () => {
        let value = 0;
        payments.forEach(payment => {
            value = value + payment.value;
        });
        return value;
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
        await updateUnverifiedPayment({ type: verifingPaymentMethod.value }, payment.id);
        await verifyPayment(payment.id);
        setVerifying(false);
        setPayment(null);
        setVerifyModal(false);
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

    const getStudentFullName = (row) => row.student !== null ? row?.student?.name + ' ' + row?.student?.lastName : "";

    const getItemById = itemId => {
        let item = "";
        try {
            const newItem = categories.find(category => category.items.find(item => item.id === itemId)).items.find(item => item.id === itemId);
            item = newItem.title;
        }catch {
            item = "";
        }
        return item;
    }

    const columns = useMemo(() => {
        const newColumns = [
            {
                name: 'Fecha',
                selector: row => dateToString(row.at),
                sortable: true,
                searchable: true,
                maxWidth: '120px',
                minWidth: '120px',
            },
            {
                name: 'Importe',
                cell: row => <span className={`${row.value >= 0 ? "text-gray-800" : "text-red-800"} whitespace-nowrap w-16 font-bold`}>{'$' + withSeparators(row.value)}</span>,
                sortable: true,
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
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getItemById(row.itemId)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getItemById(row.itemId),
            },
            {
                name: 'Abonado por',
                cell: row => <span className={(row.value >= 0) ? "text-gray-800 font-bold" : "text-gray-800"}>{getStudentFullName(row)}</span>,
                sortable: true,
                searchable: true,
                selector: row => getStudentFullName(row),
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
                cell: row => (<>{row.fileId !== null &&<a href={`${process.env.REACT_APP_BACKEND_HOST}api/v1/files/${row.fileId}`} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
                </a>}</>),
                sortable: true,
            },
            {
                name: 'Acciones',
                cell: row => (<div className="flex w-full justify-center"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row)}><DeleteIcon /></button>{canVerify && (<button className="rounded-full p-1 bg-green-200 hover:bg-green-300 mx-1" onClick={() => openVerifyModal(row)}><DoneIcon /></button>)}</div>),
                sortable: true,
            },
        ];
        return newColumns;
    }, [categories]); 

    useEffect(() => {
        getBalanceForAllPayments();
    }, [payments]);

    return(
        <>
            <Table
                className={`rounded-3xl shadow-lg ${className}`}
                columns={columns}
                data={payments}
                noDataComponent={isLoading ? 'Verificando pagos...' : 'No hay pagos disponibles'}
                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
            <div className="bg-orange-200 rounded-2xl px-8 py-4 mt-8 md:flex md:justify-between">
                <div className="md:mr-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Total: </span><span className={`${getBalanceForAllPayments() >= 0 ? "text-gray-800" : "text-red-800"} w-full text-center font-bold bg-white rounded-2xl py-2 px-3`}>${withSeparators(getBalanceForAllPayments())}</span></div>
                <div className="mt-2 md:mt-0 md:mx-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Ingresos: </span><span className="w-full text-center text-gray-800 font-bold bg-white rounded-2xl py-2 px-3">${withSeparators(getPayments())}</span></div>
                <div className="mt-2 md:mt-0 md:mx-12 flex flex-col lg:flex-row items-center"><span className="mb-2 md:mb-0">Egresos: </span><span className="w-full text-center text-red-800 font-bold bg-white rounded-2xl py-2 px-3">${withSeparators(getDischarges())}</span></div>
            </div>
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