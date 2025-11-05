import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import QrCodeIcon from '@mui/icons-material/QrCode';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import ButtonPrimary from '../button/primary';

const QRModal = ({ isOpen, onClose, preferenceId, paymentInfo }) => {
    const [qrImageUrl, setQrImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && preferenceId) {
            loadQRImage();
        }
    }, [isOpen, preferenceId]);

    const loadQRImage = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            const response = await fetch(`${baseUrl}api/v1/payments/mercadopago/preference/${preferenceId}/qr`);
            
            if (!response.ok) {
                throw new Error('Error al generar el código QR');
            }
            
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);
            setQrImageUrl(imageUrl);
        } catch (err) {
            console.error('Error loading QR:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (qrImageUrl) {
            const link = document.createElement('a');
            link.href = qrImageUrl;
            link.download = `QR-Pago-${paymentInfo?.monthName || 'pago'}-${paymentInfo?.year || ''}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleClose = () => {
        if (qrImageUrl) {
            URL.revokeObjectURL(qrImageUrl);
        }
        setQrImageUrl(null);
        setError(null);
        onClose();
    };

    return (
        <Modal
            icon={<QrCodeIcon />}
            open={isOpen}
            onClose={handleClose}
            title="Código QR de Pago"
            footer={false}
        >
            <div className="bg-white rounded-lg p-6">

                {/* Payment Info */}
                {paymentInfo && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Período:</strong> {paymentInfo.monthName} {paymentInfo.year}
                        </p>
                        {paymentInfo.studentName && (
                            <p className="text-sm text-gray-600">
                                <strong>Estudiante:</strong> {paymentInfo.studentName}
                            </p>
                        )}
                        {paymentInfo.courseName && (
                            <p className="text-sm text-gray-600">
                                <strong>Curso:</strong> {paymentInfo.courseName}
                            </p>
                        )}
                    </div>
                )}

                {/* QR Code Display */}
                <div className="text-center mb-4">
                    {isLoading && (
                        <div className="flex flex-col items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <p className="text-gray-600">Generando código QR...</p>
                        </div>
                    )}

                    {error && (
                        <div className="py-8">
                            <p className="text-red-600 mb-2">❌ {error}</p>
                            <button 
                                onClick={loadQRImage}
                                className="text-blue-600 hover:text-blue-800 underline"
                            >
                                Intentar nuevamente
                            </button>
                        </div>
                    )}

                    {qrImageUrl && !isLoading && !error && (
                        <div className="space-y-4">
                            <img 
                                src={qrImageUrl} 
                                alt="Código QR de pago" 
                                className="mx-auto max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
                                style={{ maxWidth: '280px' }}
                            />
                            <p className="text-sm text-gray-600">
                                Escanea este código con tu aplicación de MercadoPago
                            </p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    {qrImageUrl && (
                        <ButtonPrimary
                            onClick={handleDownload}
                        >
                            <DownloadIcon className="mr-2" fontSize="small" />
                            Descargar QR
                        </ButtonPrimary>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default QRModal;
