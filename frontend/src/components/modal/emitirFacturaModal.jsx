import React, { useState, useEffect, useRef, useContext } from 'react';
import Modal from '../modal';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CommonInput from '../commonInput';
import Label from '../label/label';
import studentsService from '../../services/studentsService';
import paymentsService from '../../services/paymentsService';
import { Context } from '../../context/Context';
import DownloadIcon from '@mui/icons-material/Download';

const IVA_OPTIONS = [
  { value: 'CONSUMIDOR_FINAL', label: 'Consumidor Final (Factura B)' },
  { value: 'RESPONSABLE_INSCRIPTO', label: 'Responsable Inscripto (Factura A)' },
  { value: 'MONOTRIBUTO', label: 'Monotributo (Factura B)' },
  { value: 'EXENTO', label: 'IVA Exento (Factura B)' },
];

const formatCuit = (value) => {
  const digits = value.replace(/\D/g, '').substring(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

const EmitirFacturaModal = ({ payment, isOpen, onClose, onSuccess }) => {
  const { changeAlertStatusAndMessage } = useContext(Context);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ivaCondition, setIvaCondition] = useState('CONSUMIDOR_FINAL');
  const [cuit, setCuit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (isOpen && payment) {
      const student = payment.student;
      if (student) {
        setSelectedStudent(student);
        setSearchQuery(`${student.name} ${student.lastName}`);
        setIvaCondition(student.ivaCondition || 'CONSUMIDOR_FINAL');
        setCuit(student.cuit || '');
      } else {
        setSelectedStudent(null);
        setSearchQuery('');
        setIvaCondition('CONSUMIDOR_FINAL');
        setCuit('');
      }
      setError(null);
    }
  }, [isOpen, payment]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setSelectedStudent(null);
    setShowDropdown(true);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (val.length >= 2) {
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await studentsService.searchStudents(val);
          setSearchResults(results);
        } catch {}
      }, 300);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchQuery(`${student.name} ${student.lastName}`);
    setIvaCondition(student.ivaCondition || 'CONSUMIDOR_FINAL');
    setCuit(student.cuit || '');
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      setError('Seleccioná un alumno.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await paymentsService.emitirFactura(payment.id, {
        studentId: selectedStudent.id,
        ivaCondition: ivaCondition || null,
        cuit: cuit || null,
      });
      changeAlertStatusAndMessage(true, 'success', '✅ Factura AFIP emitida correctamente.');
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al emitir la factura.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const alreadyHasInvoice = !!payment?.cae;
  const missingFiscalData = selectedStudent && (!selectedStudent.ivaCondition || !selectedStudent.cuit);

  return (
    <Modal
      size="small"
      onClose={onClose}
      icon={<ReceiptIcon />}
      open={isOpen}
      setDisplay={onClose}
      title={alreadyHasInvoice ? 'Factura AFIP emitida' : 'Emitir Factura AFIP'}
      buttonText={
        alreadyHasInvoice
          ? (<><DownloadIcon fontSize="small" style={{ marginRight: 4 }} />Descargar PDF</>)
          : isLoading
            ? (<><i className="fa fa-circle-o-notch fa-spin" /><span className="ml-2">Emitiendo...</span></>)
            : 'Emitir factura'
      }
      onClick={alreadyHasInvoice ? () => paymentsService.downloadInvoicePDF(payment.id) : handleSubmit}
      buttonDisabled={!alreadyHasInvoice && isLoading}
    >
      {payment && alreadyHasInvoice && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-1">{payment.invoiceType} N° {payment.invoiceNumber}</p>
            <p className="text-sm text-green-700">CAE: <span className="font-mono">{payment.cae}</span></p>
            {payment.caeVencimiento && <p className="text-xs text-gray-500 mt-1">Vto. CAE: {payment.caeVencimiento}</p>}
          </div>
          <p className="text-sm text-gray-500">Este pago ya tiene una factura emitida. Podés descargar el PDF.</p>
        </div>
      )}
      {payment && !alreadyHasInvoice && (
        <div className="flex flex-col gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm flex items-center gap-2">
            <span className="text-gray-500">Pago #{payment.id}</span>
            <span className="font-bold text-green-700">${payment.value}</span>
            {payment.type && <span className="text-gray-400">· {payment.type}</span>}
          </div>

          <div className="relative">
            <CommonInput
              label="Alumno"
              type="text"
              placeholder="Buscar alumno por nombre..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {searchResults.map((s) => (
                  <div
                    key={s.id}
                    className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm flex justify-between items-center"
                    onMouseDown={() => handleSelectStudent(s)}
                  >
                    <span className="font-medium">{s.name} {s.lastName}</span>
                    {s.ivaCondition && (
                      <span className="text-xs text-gray-400 ml-2">{s.ivaCondition.replace(/_/g, ' ')}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <>
              {missingFiscalData && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  Este alumno no tiene datos fiscales completos. Completalos para emitir la factura y quedarán guardados.
                </p>
              )}

              <div>
                <Label htmlFor="iva-condition-invoice">Condición IVA</Label>
                <select
                  id="iva-condition-invoice"
                  value={ivaCondition}
                  onChange={(e) => setIvaCondition(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                >
                  {IVA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <CommonInput
                label="CUIL / CUIT"
                type="text"
                placeholder="XX-XXXXXXXX-X"
                value={cuit}
                onChange={(e) => setCuit(formatCuit(e.target.value))}
              />
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-2">{error}</p>
          )}
        </div>
      )}
    </Modal>
  );
};

export default EmitirFacturaModal;
