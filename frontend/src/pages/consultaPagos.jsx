import React, { useState, useEffect } from "react";
import PaymentIcon from '@mui/icons-material/Payment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import Container from "../components/container";
import Table from "../components/table";
import Tooltip from '@mui/material/Tooltip';
import { Link, useNavigate } from "react-router-dom";
import QRModal from '../components/modal/qrModal';
import { Snackbar, Alert } from '@mui/material';
import NoDataComponent from "../components/table/noDataComponent";
import { COLORS } from "../constants";
import Loader from "../components/spinner/loader";

export default function ConsultaPagos() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mercadopago');
    const [webhookData, setWebhookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isQRModalOpen, setIsQRModalOpen] = useState(false);
    const [qrPreferenceId, setQrPreferenceId] = useState(null);
    const [qrPaymentInfo, setQrPaymentInfo] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const tabs = [
        {
            id: 'mercadopago',
            label: 'Mercado Pago',
            icon: <PaymentIcon fontSize="small" />
        }
        // Aquí se pueden agregar más tabs en el futuro
    ];

    useEffect(() => {
        fetchWebhookData();
    }, []);

    const fetchWebhookData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_HOST}api/v1/payments/mercadopago/webhook-info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            setWebhookData(data);
        } catch (err) {
            setError('Error al cargar los datos de Mercado Pago');
            console.error('Error fetching webhook data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = async (link) => {
        try {
            await navigator.clipboard.writeText(link);
            setSnackbar({
                open: true,
                message: 'Link copiado al portapapeles',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error al copiar el link:', err);
            setSnackbar({
                open: true,
                message: 'Error al copiar el link',
                severity: 'error'
            });
        }
    };

    const handleGenerateQR = (payment) => {
        // Abrir modal de QR con los datos del pago
        setQrPreferenceId(payment.id);
        setQrPaymentInfo({
            monthName: payment.monthName,
            year: payment.year,
            studentName: payment.studentName,
            courseName: payment.courseTitle
        });
        setIsQRModalOpen(true);
    };

    const handleCloseQRModal = () => {
        setIsQRModalOpen(false);
        setQrPreferenceId(null);
        setQrPaymentInfo(null);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSendEmail = async (payment) => {
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const response = await fetch(`${baseUrl}api/v1/payments/mercadopago/preference/${payment.id}/email`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al enviar el email');
            }
            
            const result = await response.json();
            setSnackbar({
                open: true,
                message: `Email enviado a ${result.email}`,
                severity: 'success'
            });
        } catch (err) {
            console.error('Error sending email:', err);
            setSnackbar({
                open: true,
                message: err.message || 'Error al enviar el email',
                severity: 'error'
            });
        }
    };

    const handleStatusClick = (payment) => {
        if (payment.completed && payment.paymentId) {
            navigate(`/home/payments?id=${payment.paymentId}`);
        }
    };

    const columns = [
        {
            name: 'Estudiante',
            selector: row => row.studentName,
            cell: row => (
                <Link 
                    style={{ color: COLORS.primary[900] }}
                    to={`/home/students/${row.studentId}`} 
                    className="underline mx-1 cursor-pointer"
                >
                    {row.studentName}
                </Link>
            ),
            sortable: true,
            searchable: true,
        },
        {
            name: 'Curso',
            selector: row => row.courseTitle,
            cell: row => (
                <Link 
                    style={{ color: COLORS.primary[900] }}
                    to={`/home/courses/${row.courseId}`} 
                    className="underline mx-1 cursor-pointer"
                >
                    {row.courseTitle}
                </Link>
            ),
            sortable: true,
            searchable: true,
        },
        {
            name: 'Período',
            selector: row => `${row.monthName} ${row.year}`,
            sortable: true,
        },
        {
            name: 'Monto',
            selector: row => row.value,
            cell: row => "$" + row.value,
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.status,
            cell: row => {
                const getStatusInfo = () => {
                    // Si está completado, siempre es "Aprobado" en verde
                    if (row.completed) {
                        return {
                            label: 'Aprobado',
                            className: 'bg-green-100 text-green-800',
                            tooltip: 'Pago completado y aprobado'
                        };
                    }

                    // Evaluar según el status
                    switch (row.status) {
                        case 'approved':
                            return {
                                label: 'Aprobado',
                                className: 'bg-blue-100 text-blue-800',
                                tooltip: 'El pago se realizó con al menos un reembolso parcial.'
                            };
                        case 'authorized':
                            return {
                                label: 'Autorizado',
                                className: 'bg-blue-100 text-blue-800',
                                tooltip: 'Pago autorizado y pendiente de captura'
                            };

                        case 'in_process':
                            const inProcessLabels = {
                                'offline_process': 'Procesando Offline',
                                'pending_contingency': 'Procesando',
                                'pending_review_manual': 'Revisión Manual'
                            };
                            const inProcessTooltips = {
                                'offline_process': 'Por una falta de procesamiento online, el pago está siendo procesado de manera offline',
                                'pending_contingency': 'Estamos procesando tu pago. Menos de 2 días hábiles te avisaremos por e-mail si se acreditó',
                                'pending_review_manual': 'Estamos procesando tu pago. Menos de 2 días hábiles te avisaremos por e-mail si se acreditó o si necesitamos más información'
                            };
                            return {
                                label: inProcessLabels[row.statusDetail] || 'En Proceso',
                                className: '',
                                style: { backgroundColor: COLORS.primary[100], color: COLORS.primary[900] },
                                tooltip: inProcessTooltips[row.statusDetail] || 'Pago en proceso'
                            };

                        case 'pending':
                            const pendingLabels = {
                                'pending_waiting_transfer': 'Pendiente',
                                'pending_waiting_payment': 'Pendiente',
                                'pending_challenge': 'Confirmando'
                            };
                            const pendingTooltips = {
                                'pending_waiting_transfer': 'Esperando a que el usuario termine el proceso de pago en su banco',
                                'pending_waiting_payment': 'El pago queda pendiente hasta que el usuario realice el pago',
                                'pending_challenge': 'Hay una confirmación pendiente a causa de un challenge'
                            };
                            return {
                                label: pendingLabels[row.statusDetail] || 'Pendiente',
                                className: 'bg-gray-100 text-gray-900',
                                tooltip: pendingTooltips[row.statusDetail] || 'Pago pendiente'
                            };

                        case 'cancelled':
                            const cancelledLabels = {
                                'expired': 'Expirado',
                                'by_collector': 'Cancelado',
                                'by_payer': 'Cancelado'
                            };
                            const cancelledTooltips = {
                                'expired': 'El pago fue cancelado luego de haber estado 30 días en un estado pendiente',
                                'by_collector': 'El pago fue cancelado por el collector',
                                'by_payer': 'El pago fue cancelado por el pagador'
                            };
                            return {
                                label: cancelledLabels[row.statusDetail] || 'Cancelado',
                                className: 'bg-red-100 text-red-800',
                                tooltip: cancelledTooltips[row.statusDetail] || 'Pago cancelado'
                            };

                        case 'refunded':
                            const refoundTooltips = {
                                "refunded": "El pago fue devuelto por el collector.",
                                "by_admin": "El pago fue devuelto por el administrador."
                            }
                            return {
                                label: "Devuelto",
                                className: 'bg-red-100 text-red-800',
                                tooltip: refoundTooltips[row.statusDetail] || 'Pago devuelto'
                            };

                        case 'charged_back':
                            const chargedBackLabels = {
                                'settled': 'Retenido',
                                'reimbursed': 'Devuelto',
                                'in_process': 'Contracargo en Proceso'
                            };
                            const chargedBackTooltips = {
                                'settled': 'El dinero fue retenido luego de un proceso de contracargo',
                                'reimbursed': 'El dinero fue devuelto luego de un proceso de contracargo',
                                'in_process': 'El pago está en proceso de ser recuperado debido a un desconocimiento por parte del pagador'
                            };
                            return {
                                label: chargedBackLabels[row.statusDetail] || 'Contracargo',
                                className: 'bg-red-100 text-red-800',
                                tooltip: chargedBackTooltips[row.statusDetail] || 'Contracargo'
                            };

                        case 'rejected':
                            const rejectedLabels = {
                                'bank_error': 'Error Bancario',
                                'cc_rejected_3ds_challenge': 'Rechazado 3DS',
                                'cc_rejected_3ds_mandatory': '3DS Obligatorio',
                                'cc_rejected_bad_filled_card_number': 'Número de Tarjeta',
                                'cc_rejected_bad_filled_date': 'Fecha Vencimiento',
                                'cc_rejected_bad_filled_other': 'Datos Incorrectos',
                                'cc_rejected_bad_filled_security_code': 'Código Seguridad',
                                'cc_rejected_blacklist': 'Lista Negra',
                                'cc_rejected_call_for_authorize': 'Autorizar Pago',
                                'cc_rejected_card_disabled': 'Tarjeta Deshabilitada',
                                'cc_rejected_card_error': 'Error de Tarjeta',
                                'cc_rejected_duplicated_payment': 'Pago Duplicado',
                                'cc_rejected_high_risk': 'Alto Riesgo',
                                'cc_rejected_insufficient_amount': 'Fondos Insuficientes',
                                'cc_rejected_invalid_installments': 'Cuotas Inválidas',
                                'cc_rejected_max_attempts': 'Máximo Intentos',
                                'cc_rejected_other_reason': 'Otro Motivo',
                                'cc_amount_rate_limit_exceeded': 'Límite Excedido',
                                'rejected_insufficient_data': 'Datos Insuficientes',
                                'rejected_by_bank': 'Rechazado por Banco',
                                'rejected_by_regulations': 'Rechazado por Regulaciones',
                                'insufficient_amount': 'Monto Insuficiente'
                            };
                            return {
                                label: rejectedLabels[row.statusDetail] || 'Rechazado',
                                className: 'bg-red-100 text-red-800',
                                tooltip: `Pago rechazado: ${row.statusDetail || 'motivo desconocido'}`
                            };

                        default:
                            return {
                                label: row.status || 'Desconocido',
                                className: 'bg-gray-100 text-gray-800',
                                tooltip: `Estado: ${row.status || 'desconocido'}`
                            };
                    }
                };

                const statusInfo = getStatusInfo();

                return (
                    <Tooltip title={statusInfo.tooltip}>
                        <span 
                            className={`${row.completed ? "cursor-pointer" : "cursor-help"} inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.className}`}
                            onClick={() => handleStatusClick(row)}
                        >
                            {statusInfo.label}
                        </span>
                    </Tooltip>
                );
            },
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => (
                <div className="flex w-full justify-center">
                    {row.preferenceLink && (
                        <>
                            <Tooltip title="Copiar link">
                                <button 
                                    className="rounded-full p-1 bg-blue-200 hover:bg-blue-300 mx-1" 
                                    onClick={() => handleCopyLink(row.preferenceLink)}
                                >
                                    <ContentCopyIcon fontSize="small" />
                                </button>
                            </Tooltip>
                            <Tooltip title="Generar QR">
                                <button 
                                    className="rounded-full p-1 bg-purple-200 hover:bg-purple-300 mx-1" 
                                    onClick={() => handleGenerateQR(row)}
                                >
                                    <QrCodeIcon fontSize="small" />
                                </button>
                            </Tooltip>
                            <Tooltip title={hasEmail(row.student.email) ? "Enviar email" : "El estudiante no tiene email"}>
                                <span>
                                    <button 
                                        className={`rounded-full p-1 mx-1 ${
                                            hasEmail(row.student.email) 
                                                ? 'bg-green-200 hover:bg-green-300 cursor-pointer' 
                                                : 'bg-gray-200 cursor-not-allowed opacity-50'
                                        }`}
                                        onClick={() => row.student.email && handleSendEmail(row)}
                                        disabled={!hasEmail(row.student.email)}
                                    >
                                        <EmailIcon fontSize="small" />
                                    </button>
                                </span>
                            </Tooltip>
                        </>
                    )}
                </div>
            ),
            sortable: false,
        },
    ];

    const hasEmail = (email) => {
        return email !== undefined && email != null && email !== "";
    };

    return (
        <Container title="Consulta Pagos">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                {/* Tab Headers */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={activeTab === tab.id ? { borderBottomColor: COLORS.primary[500], color: COLORS.primary[600] } : {}}
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                                    activeTab === tab.id
                                        ? ''
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="pt-6">
                    {activeTab === 'mercadopago' && (
                        <div>
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="flex flex-col items-center justify-center">
                                        <Loader/>
                                        <p className="text-gray-500 mt-2">Cargando datos de Mercado Pago...</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-center py-12">
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                                        <p className="text-red-800 text-sm">{error}</p>
                                        <button 
                                            onClick={fetchWebhookData}
                                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                        >
                                            Reintentar
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!loading && !error && webhookData && (
                                <div>
                                    {/* Statistics Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-blue-800">Total</h3>
                                            <p className="text-2xl font-bold text-blue-900">{webhookData.stats?.total || 0}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-green-800">Completados</h3>
                                            <p className="text-2xl font-bold text-green-900">{webhookData.stats?.completed || 0}</p>
                                        </div>
                                        <div className="bg-yellow-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-yellow-800">Pendientes</h3>
                                            <p className="text-2xl font-bold text-yellow-900">{webhookData.stats?.pending || 0}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-gray-800">Última actualización</h3>
                                            <p className="text-sm text-gray-600">
                                                {webhookData.timestamp ? new Date(webhookData.timestamp).toLocaleString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Payments Table */}
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Historial de Pagos</h3>
                                        <Table
                                            columns={columns}
                                            data={webhookData.data || []}
                                            pagination
                                            paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                            noDataComponent={
                                                <NoDataComponent Icon={PaymentIcon} title="No hay datos disponibles" subtitle="No se encontraron registros de pagos de Mercado Pago"/>
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Modal QR */}
            <QRModal 
                isOpen={isQRModalOpen} 
                onClose={handleCloseQRModal} 
                preferenceId={qrPreferenceId} 
                paymentInfo={qrPaymentInfo} 
            />
            
            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
}
