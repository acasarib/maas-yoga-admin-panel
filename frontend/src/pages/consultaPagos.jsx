import React, { useState, useEffect } from "react";
import PaymentIcon from '@mui/icons-material/Payment';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import Container from "../components/container";
import Table from "../components/table";
import Tooltip from '@mui/material/Tooltip';
import { Link } from "react-router-dom";
import QRModal from '../components/modal/qrModal';
import { Snackbar, Alert } from '@mui/material';

export default function ConsultaPagos() {
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

    const handleSendEmail = (payment) => {
        // TODO: Implementar envío de email
        console.log('Enviar email para:', payment);
    };

    const columns = [
        {
            name: 'Estudiante',
            selector: row => row.studentName,
            cell: row => (
                <Link 
                    to={`/home/students/${row.studentId}`} 
                    className="underline text-yellow-900 mx-1 cursor-pointer"
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
                    to={`/home/courses/${row.courseId}`} 
                    className="underline text-yellow-900 mx-1 cursor-pointer"
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
            selector: row => row.finalAmount,
            cell: row => (
                <div>
                    ${row.finalAmount}
                    {row.discount > 0 && (
                        <span className="text-green-600 text-xs ml-1">
                            (-{row.discount}%)
                        </span>
                    )}
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Estado',
            selector: row => row.status,
            cell: row => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    row.completed 
                        ? 'bg-green-100 text-green-800' 
                        : row.status === 'approved'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {row.completed ? 'Completado' : row.status}
                </span>
            ),
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
                            <Tooltip title={row.studentEmail ? "Enviar email" : "El estudiante no tiene email"}>
                                <span>
                                    <button 
                                        className={`rounded-full p-1 mx-1 ${
                                            row.studentEmail 
                                                ? 'bg-green-200 hover:bg-green-300 cursor-pointer' 
                                                : 'bg-gray-200 cursor-not-allowed opacity-50'
                                        }`}
                                        onClick={() => row.studentEmail && handleSendEmail(row)}
                                        disabled={!row.studentEmail}
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
                                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                                    activeTab === tab.id
                                        ? 'border-orange-500 text-orange-600'
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
                <div className="p-6">
                    {activeTab === 'mercadopago' && (
                        <div>
                            {loading && (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                    <p className="text-gray-500">Cargando datos de Mercado Pago...</p>
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
                                                <div className="text-center py-12">
                                                    <PaymentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                        No hay datos disponibles
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        No se encontraron registros de pagos de Mercado Pago
                                                    </p>
                                                </div>
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
