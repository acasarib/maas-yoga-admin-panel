import React, { useState, useEffect, useContext } from "react";
import PaymentIcon from '@mui/icons-material/Payment';
import Container from "../components/container";
import { Context } from "../context/Context";

export default function ConsultaPagos() {
    const [activeTab, setActiveTab] = useState('mercadopago');
    const [webhookData, setWebhookData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                                    <div className="bg-white border rounded-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="text-lg font-medium text-gray-900">Historial de Pagos</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Curso</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Período</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {webhookData.data?.map((payment) => (
                                                        <tr key={payment.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                                                                {payment.id.substring(0, 20)}...
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.studentName}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.courseTitle}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.monthName} {payment.year}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                ${payment.finalAmount}
                                                                {payment.discount > 0 && (
                                                                    <span className="text-green-600 text-xs ml-1">
                                                                        (-{payment.discount}%)
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    payment.completed 
                                                                        ? 'bg-green-100 text-green-800' 
                                                                        : payment.status === 'approved'
                                                                        ? 'bg-blue-100 text-blue-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                }`}>
                                                                    {payment.completed ? 'Completado' : payment.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {payment.preferenceLink && (
                                                                    <a 
                                                                        href={payment.preferenceLink} 
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="text-blue-600 hover:text-blue-800 underline"
                                                                    >
                                                                        Ver enlace
                                                                    </a>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {(!webhookData.data || webhookData.data.length === 0) && (
                                            <div className="text-center py-12">
                                                <PaymentIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    No hay datos disponibles
                                                </h3>
                                                <p className="text-gray-500">
                                                    No se encontraron registros de pagos de Mercado Pago
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
}
