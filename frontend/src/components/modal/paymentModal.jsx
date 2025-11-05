import React, { useState, useEffect } from 'react';
import Modal from '../modal';
import PaymentIcon from '@mui/icons-material/Payment';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import LinkIcon from '@mui/icons-material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import CommonInput from '../commonInput';
import CustomRadio from '../radio/customRadio';
import CustomCheckbox from '../checkbox/customCheckbox';

const PaymentModal = ({ isOpen, onClose, studentData, monthData, onGeneratePayment }) => {
    const [paymentMethod, setPaymentMethod] = useState('mercadopago');
    const [mercadoPagoOption, setMercadoPagoOption] = useState('link');
    const [isGenerating, setIsGenerating] = useState(false);
    const [amount, setAmount] = useState(monthData?.amount || "");
    const [discount, setDiscount] = useState("");
    const [notifyOnPayment, setNotifyOnPayment] = useState(false);


    const handleMercadoPagoOptionChange = (event) => {
        setMercadoPagoOption(event.target.value);
    };

    const handleAmountChange = (event) => {
        setAmount(event.target.value);
    };

    const handleDiscountChange = (event) => {
        setDiscount(event.target.value);
    };

    const handleNotifyChange = (event) => {
        setNotifyOnPayment(event.target.checked);
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
                value: parseFloat(amount) || 0,
                discount: parseFloat(discount) || 0,
                notifyOnPayment
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
            buttonDisabled={isGenerating || amount === "" || amount === "0"}
            size="medium"
        >
            <div>
                <p className="text-gray-600">
                    Seleccione el método de pago para abonar el curso.
                </p>

                {/* Payment Method Tabs */}
                <div>
                    <FormLabel component="legend" className="text-gray-900 font-medium mb-3 block">
                        Método de pago
                    </FormLabel>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('mercadopago')}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                                    paymentMethod === 'mercadopago'
                                        ? 'border-orange-500 text-orange-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <img 
                                    src="/assets/images/mp.png" 
                                    alt="Mercado Pago" 
                                    className="w-8 h-6 mr-2 object-contain"
                                />
                                Mercado Pago
                            </button>
                        </nav>
                    </div>
                </div>

                {/* MercadoPago Options */}
                {paymentMethod === 'mercadopago' && (
                    <div className="mt-6">
                        <FormControl component="fieldset">
                            <FormLabel component="legend" className="text-gray-900 font-medium">
                                Opciones de Mercado Pago
                            </FormLabel>
                            <RadioGroup
                                value={mercadoPagoOption}
                                onChange={handleMercadoPagoOptionChange}
                                className="mt-3 space-y-2"
                            >
                                <CustomRadio 
                                    value="link"
                                    label={
                                        <div className="flex items-start w-full">
                                            <div className="flex-shrink-0 mr-3 mt-2">
                                                {getMercadoPagoOptionIcon('link')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">Enlace de pago</span>
                                                <span className="text-sm text-gray-500 mt-1">
                                                    {getMercadoPagoOptionDescription('link')}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                />
                                <CustomRadio 
                                    value="qr"
                                    label={
                                        <div className="flex items-start w-full">
                                            <div className="flex-shrink-0 mr-3 mt-2">
                                                {getMercadoPagoOptionIcon('qr')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium">Código QR</span>
                                                <span className="text-sm text-gray-500 mt-1">
                                                    {getMercadoPagoOptionDescription('qr')}
                                                </span>
                                            </div>
                                        </div>
                                    }
                                />
                                <CustomRadio 
                                    value="email"
                                    disabled={!studentData?.email}
                                    label={
                                        <div className="flex items-start w-full">
                                            <div className="flex-shrink-0 mr-3 mt-2">
                                                {getMercadoPagoOptionIcon('email')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`font-medium ${!studentData?.email ? 'text-gray-400' : ''}`}>
                                                    Envío por email
                                                </span>
                                                <span className="text-sm text-gray-500 mt-1">
                                                    {studentData?.email 
                                                        ? `Enviar a: ${studentData.email}` 
                                                        : 'El alumno no tiene email asociado'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </div>
                )}

                {/* Amount and Discount Inputs */}
                <div className="mt-8 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="pb-1">
                        <CommonInput 
                            label="Importe del pago"
                            name="amount"
                            currency
                            className="block font-bold text-sm text-gray-700 mb-2"
                            type="number" 
                            placeholder="Ingrese el importe" 
                            value={amount}
                            onChange={handleAmountChange}
                            min="0"
                            step="1"
                        />
                    </div>

                    <div className="pb-1">
                        <CommonInput 
                            label="Descuento"
                            symbol="%"
                            name="discount"
                            className="block font-bold text-sm text-gray-700 mb-2"
                            type="number" 
                            placeholder="Ingrese el descuento" 
                            value={discount}
                            onChange={handleDiscountChange}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                {/* Student and Course Info */}
                {studentData && monthData && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Detalles del pago</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p><span className="font-medium">Alumno:</span> {studentData.name}</p>
                            <p><span className="font-medium">Año:</span> {monthData.year}</p>
                            <p><span className="font-medium">Mes:</span> {monthData.monthName}</p>
                            <p><span className="font-medium">Importe:</span> ${amount}</p>
                            <p><span className="font-medium">Descuento:</span> {discount}%</p>
                        </div>
                    </div>
                )}

                {/* Notification Checkbox */}
                <CustomCheckbox
                    checked={notifyOnPayment}
                    onChange={handleNotifyChange}
                    label="Notificarme cuando se acredite el pago"
                />
            </div>
        </Modal>
    );
};

export default PaymentModal;
