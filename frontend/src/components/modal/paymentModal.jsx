import React, { useState, useEffect } from 'react';
import { COLORS } from "../../constants";
import Modal from '../modal';
import PaymentIcon from '@mui/icons-material/Payment';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import CommonInput from '../commonInput';
import CustomCheckbox from '../checkbox/customCheckbox';
import CustomRadio from '../radio/customRadio';
import MercadoPagoList from '../list/mercadoPagoList';

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

    useEffect(() => {
        if (!studentData?.email && mercadoPagoOption === 'email') {
            setMercadoPagoOption('link');
        }
    }, [studentData, mercadoPagoOption]);

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
                                style={paymentMethod === 'mercadopago' ? { borderBottomColor: COLORS.primary[500], color: COLORS.primary[600] } : {}}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                                    paymentMethod === 'mercadopago'
                                        ? ''
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
                            <MercadoPagoList
                                studentData={studentData}
                                mercadoPagoOption={mercadoPagoOption}
                                handleMercadoPagoOptionChange={handleMercadoPagoOptionChange}
                            />
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
