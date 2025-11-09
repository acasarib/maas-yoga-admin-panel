import React from 'react'
import LinkIcon from '@mui/icons-material/Link';
import QrCodeIcon from '@mui/icons-material/QrCode';
import EmailIcon from '@mui/icons-material/Email';
import CustomRadio from '../radio/customRadio';
import { COLORS } from '../../constants';

const MercadoPagoList = ({ studentData, handleMercadoPagoOptionChange, mercadoPagoOption }) => {

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
  

  const options = [
    {
      value: 'link',
      title: 'Enlace de pago',
      description: getMercadoPagoOptionDescription('link'),
      icon: getMercadoPagoOptionIcon('link'),
      disabled: false,
    },
    {
      value: 'qr',
      title: 'Código QR',
      description: getMercadoPagoOptionDescription('qr'),
      icon: getMercadoPagoOptionIcon('qr'),
      disabled: false,
    },
    {
      value: 'email',
      title: 'Envío por email',
      description: studentData?.email ? `Enviar a: ${studentData.email}` : 'El alumno no tiene email asociado',
      icon: getMercadoPagoOptionIcon('email'),
      disabled: !studentData?.email,
    },
  ];
  return (
    <ul className="mt-3 flex flex-col max-w-md">
      {options.map((option, i) => {
        const isSelected = mercadoPagoOption === option.value;
        const optionId = `mercadopago-option-${option.value}`;
        const baseClasses = 'inline-flex items-center gap-x-2 py-3 px-4 text-sm font-medium border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg transition-colors';
        const selectedClasses = isSelected ? ' border-primary-500 bg-primary-50 text-primary-600 shadow-sm' : '';
        const disabledClasses = option.disabled ? ' opacity-60 cursor-not-allowed' : ' cursor-pointer hover:bg-gray-50';
        const liStyle = {};
        if (isSelected) {
          liStyle.backgroundColor = COLORS.primary[50];
          liStyle.borderColor = COLORS.primary[600];
        }
        const previousSelected = i > 0 && mercadoPagoOption === options[i - 1].value;
        if (previousSelected) {
          liStyle.borderTop = "none";
        }

        return (
          <li
            key={option.value}
            style={liStyle}
            className={`${baseClasses}${selectedClasses}${disabledClasses}`}
          >
            <div className="relative flex items-center w-full">
              <div className="flex items-center h-5">
                <CustomRadio
                  id={optionId}
                  name="mercadopago-option"
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={handleMercadoPagoOptionChange}
                  label={null}
                />
              </div>
              <label htmlFor={optionId} className="block w-full">
                <div className="flex items-start">
                  <div className="flex flex-col">
                    <span className={`flex items-center font-medium ${option.disabled ? 'text-gray-400' : 'text-gray-900'}`}>
                      {option.title}
                      <div className="flex-shrink-0 ml-2" style={{ color: COLORS.primary[600] }}>
                        {option.icon}
                      </div>
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      {option.description}
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </li>
        );
      })}
  </ul>
  )
}

export default MercadoPagoList