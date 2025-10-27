import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import PaymentIcon from '@mui/icons-material/Payment';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import LinkIcon from '@mui/icons-material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';

const PaymentModal = ({ isOpen, onClose, studentData, monthData, onGeneratePayment }) => {
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [mercadoPagoOption, setMercadoPagoOption] = useState('link');
    const [isGenerating, setIsGenerating] = useState(false);
    const [amount, setAmount] = useState(monthData?.amount || 0);

    const handlePaymentMethodChange = (event) => {
        setPaymentMethod(event.target.value);
    };

    const handleMercadoPagoOptionChange = (event) => {
        setMercadoPagoOption(event.target.value);
    };

    const handleAmountChange = (event) => {
        setAmount(parseFloat(event.target.value) || 0);
    };

    // Actualizar el precio cuando cambien los datos del mes
    useEffect(() => {
        if (monthData?.amount) {
            setAmount(monthData.amount);
        }
    }, [monthData]);

    const handleGeneratePayment = async () => {
        setIsGenerating(true);
        try {
            await onGeneratePayment({
                paymentMethod,
                mercadoPagoOption,
                studentData,
                monthData,
                amount
            });
        } catch (error) {
            console.error('Error generating payment:', error);
        } finally {
            setIsGenerating(false);
            onClose();
        }
    };

    const getMercadoPagoOptionIcon = (option) => {
        switch (option) {
            case 'link':
                return <LinkIcon fontSize="small" className="mr-2" />;
            case 'qr':
                return <QrCodeIcon fontSize="small" className="mr-2" />;
            case 'email':
                return <EmailIcon fontSize="small" className="mr-2" />;
            default:
                return null;
        }
    };

    const getMercadoPagoOptionDescription = (option) => {
        switch (option) {
            case 'link':
                return 'Generar un enlace de pago que podrás compartir';
            case 'qr':
                return 'Generar un código QR para escanear y pagar';
            case 'email':
                return 'Enviar enlace de pago por correo electrónico al alumno';
            default:
                return '';
        }
    };

    return (
        <Modal 
            onClose={onClose} 
            icon={<PaymentIcon />} 
            open={isOpen} 
            setDisplay={onClose} 
            title="Abonar curso"
            buttonText={isGenerating ? (
                <>
                    <i className="fa fa-circle-o-notch fa-spin"></i>
                    <span className="ml-2">Generando...</span>
                </>
            ) : (
                <span>Generar pago</span>
            )}
            onClick={handleGeneratePayment}
            buttonDisabled={isGenerating}
            size="medium"
        >
            <div className="space-y-6">
                <p className="text-gray-600">
                    Seleccione el método de pago para abonar el curso.
                </p>

                {/* Payment Method Selection */}
                <FormControl component="fieldset">
                    <FormLabel component="legend" className="text-gray-900 font-medium">
                        Método de pago
                    </FormLabel>
                    <RadioGroup
                        value={paymentMethod}
                        onChange={handlePaymentMethodChange}
                        className="mt-2"
                    >
                        <FormControlLabel 
                            value="mercadopago" 
                            control={<Radio color="primary" />} 
                            label={
                                <div className="flex items-center">
                                    <img 
                                        src="https://http2.mlstatic.com/frontend-assets/ml-web-navigation/ui-navigation/5.21.22/mercadolibre/logo_small.png" 
                                        alt="MercadoPago" 
                                        className="w-6 h-6 mr-2"
                                    />
                                    MercadoPago
                                </div>
                            }
                        />
                    </RadioGroup>
                </FormControl>

                {/* MercadoPago Options */}
                {paymentMethod === 'mercadopago' && (
                    <FormControl component="fieldset" className="ml-4">
                        <FormLabel component="legend" className="text-gray-900 font-medium">
                            Opciones de MercadoPago
                        </FormLabel>
                        <RadioGroup
                            value={mercadoPagoOption}
                            onChange={handleMercadoPagoOptionChange}
                            className="mt-2"
                        >
                            <FormControlLabel 
                                value="link" 
                                control={<Radio color="primary" size="small" />} 
                                label={
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            {getMercadoPagoOptionIcon('link')}
                                            <span>Enlace de pago</span>
                                        </div>
                                        <span className="text-sm text-gray-500 ml-6">
                                            {getMercadoPagoOptionDescription('link')}
                                        </span>
                                    </div>
                                }
                            />
                            <FormControlLabel 
                                value="qr" 
                                control={<Radio color="primary" size="small" />} 
                                label={
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            {getMercadoPagoOptionIcon('qr')}
                                            <span>Código QR</span>
                                        </div>
                                        <span className="text-sm text-gray-500 ml-6">
                                            {getMercadoPagoOptionDescription('qr')}
                                        </span>
                                    </div>
                                }
                            />
                            <FormControlLabel 
                                value="email" 
                                control={<Radio color="primary" size="small" />} 
                                label={
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            {getMercadoPagoOptionIcon('email')}
                                            <span>Envío por email</span>
                                        </div>
                                        <span className="text-sm text-gray-500 ml-6">
                                            {getMercadoPagoOptionDescription('email')}
                                        </span>
                                    </div>
                                }
                            />
                        </RadioGroup>
                    </FormControl>
                )}

                {/* Amount Input */}
                <FormControl component="fieldset">
                    <FormLabel component="legend" className="text-gray-900 font-medium">
                        Importe del pago
                    </FormLabel>
                    <div className="mt-2">
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ingrese el importe"
                        />
                    </div>
                </FormControl>

                {/* Student and Course Info */}
                {studentData && monthData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Detalles del pago</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Alumno:</span> {studentData.name}</p>
                            <p><span className="font-medium">Mes:</span> {monthData.monthName}</p>
                            <p><span className="font-medium">Año:</span> {monthData.year}</p>
                            <p><span className="font-medium">Importe:</span> ${amount}</p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PaymentModal;
