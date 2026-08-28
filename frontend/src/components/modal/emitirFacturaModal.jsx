import React, { useState, useEffect, useRef, useContext } from 'react';
import Modal from '../modal';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CommonInput from '../commonInput';
import Label from '../label/label';
import studentsService from '../../services/studentsService';
import paymentsService from '../../services/paymentsService';
import { Context } from '../../context/Context';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';
import { Tooltip } from '@mui/material';

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

const formatDni = (value) => value.replace(/\D/g, '').substring(0, 8);

const formatMoney = (n) => `$${(parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Factura A (Responsable Inscripto) exige CUIT siempre — por definición, ser Responsable
// Inscripto implica estar registrado con CUIT ante AFIP, no admite DNI ni CUIL (ver afipService.js).
// Factura B sí acepta identificar al comprador con DNI, CUIT o CUIL, o dejarlo sin identificar.
const deriveDocState = (student) => {
  const iva = student?.ivaCondition || 'CONSUMIDOR_FINAL';
  if (iva === 'RESPONSABLE_INSCRIPTO') {
    return { docType: 'CUIT', cuit: student?.cuit || '', documentNumber: '' };
  }
  if (student?.document) {
    return { docType: 'DNI', cuit: student?.cuit || '', documentNumber: String(student.document) };
  }
  if (student?.cuit) {
    return { docType: 'CUIT', cuit: student.cuit, documentNumber: '' };
  }
  return { docType: '', cuit: '', documentNumber: '' };
};

const EmitirFacturaModal = ({ payments = [], isOpen, onClose, onSuccess }) => {
  const { changeAlertStatusAndMessage } = useContext(Context);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [ivaCondition, setIvaCondition] = useState('CONSUMIDOR_FINAL');
  const [cuit, setCuit] = useState('');
  const [docType, setDocType] = useState(''); // '' (sin identificar) | 'DNI' | 'CUIT' | 'CUIL' — solo aplica a Factura B
  const [documentNumber, setDocumentNumber] = useState('');
  const [itemState, setItemState] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [emittedData, setEmittedData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef(null);

  const studentIds = [...new Set(payments.map((p) => p.studentId || p.student?.id).filter(Boolean))];
  const isMixedStudents = studentIds.length > 1;

  useEffect(() => {
    if (isOpen && payments.length > 0) {
      setEmittedData(null);
      setDuplicateWarning(null);
      setError(null);

      const commonStudent = !isMixedStudents ? (payments.find((p) => p.student)?.student || null) : null;
      if (commonStudent) {
        setSelectedStudent(commonStudent);
        setSearchQuery(`${commonStudent.name} ${commonStudent.lastName}`);
        setIvaCondition(commonStudent.ivaCondition || 'CONSUMIDOR_FINAL');
        const doc = deriveDocState(commonStudent);
        setDocType(doc.docType);
        setCuit(doc.cuit);
        setDocumentNumber(doc.documentNumber);
      } else {
        setSelectedStudent(null);
        setSearchQuery('');
        setIvaCondition('CONSUMIDOR_FINAL');
        setDocType('');
        setCuit('');
        setDocumentNumber('');
      }

      const initialItems = {};
      payments.forEach((p) => {
        initialItems[p.id] = { amount: p.value, concept: '' };
      });
      setItemState(initialItems);
    }
  }, [isOpen, payments, isMixedStudents]);

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
    const doc = deriveDocState(student);
    setDocType(doc.docType);
    setCuit(doc.cuit);
    setDocumentNumber(doc.documentNumber);
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleIvaConditionChange = (value) => {
    setIvaCondition(value);
    if (value === 'RESPONSABLE_INSCRIPTO') setDocType('CUIT');
  };

  const updateItemAmount = (paymentId, amount) => {
    setItemState((prev) => ({ ...prev, [paymentId]: { ...prev[paymentId], amount } }));
  };

  const updateItemConcept = (paymentId, concept) => {
    setItemState((prev) => ({ ...prev, [paymentId]: { ...prev[paymentId], concept } }));
  };

  const total = payments.reduce((sum, p) => sum + (parseFloat(itemState[p.id]?.amount) || 0), 0);
  const hasInvalidAmount = payments.some((p) => !(parseFloat(itemState[p.id]?.amount) > 0));

  const handleSubmit = async (confirmDuplicates = false) => {
    if (isMixedStudents) return;
    if (!selectedStudent) {
      setError('Seleccioná un alumno.');
      return;
    }
    if (hasInvalidAmount) {
      setError('Todos los movimientos deben tener un monto mayor a 0.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const items = payments.map((p) => ({
        paymentId: p.id,
        concept: (itemState[p.id]?.concept || '').trim(),
        amount: parseFloat(itemState[p.id]?.amount),
      }));
      const isResponsable = ivaCondition === 'RESPONSABLE_INSCRIPTO';
      const result = await paymentsService.emitirFactura(items, {
        studentId: selectedStudent.id,
        ivaCondition: ivaCondition || null,
        docType: isResponsable ? 'CUIT' : (docType || null),
        cuit: (isResponsable || docType === 'CUIT' || docType === 'CUIL') ? (cuit || null) : undefined,
        document: (!isResponsable && docType === 'DNI') ? (documentNumber || null) : undefined,
        confirmDuplicates,
      });
      changeAlertStatusAndMessage(true, 'success', 'Factura AFIP emitida correctamente.');
      setEmittedData(result);
      setDuplicateWarning(null);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (e) {
      if (e?.response?.status === 409 && e?.response?.data?.alreadyInvoicedPaymentIds) {
        setDuplicateWarning(e.response.data.alreadyInvoicedPaymentIds);
      } else {
        const msg = e?.response?.data?.message || e?.message || 'Error al emitir la factura.';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const primaryPaymentId = payments[0]?.id;
  const alreadyHasInvoice = !!emittedData || (payments.length === 1 && !!payments[0]?.cae);
  const invoiceDisplay = emittedData || (payments.length === 1 ? payments[0] : null);
  const invoiceStudent = selectedStudent || payments[0]?.student;
  const studentEmail = invoiceStudent?.email || null;

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      await paymentsService.sendInvoiceByEmail(primaryPaymentId);
      changeAlertStatusAndMessage(true, 'success', `Factura enviada a ${studentEmail}`);
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al enviar el email.';
      changeAlertStatusAndMessage(true, 'error', msg);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const missingFiscalData = selectedStudent && (!selectedStudent.ivaCondition || (!selectedStudent.cuit && !selectedStudent.document));

  const primaryButtonAction = alreadyHasInvoice
    ? () => paymentsService.downloadInvoicePDF(primaryPaymentId)
    : () => handleSubmit(!!duplicateWarning);

  const primaryButtonText = alreadyHasInvoice
    ? (<><DownloadIcon fontSize="small" style={{ marginRight: 4 }} />Descargar PDF</>)
    : isLoading
      ? (<><i className="fa fa-circle-o-notch fa-spin" /><span className="ml-2">Emitiendo...</span></>)
      : duplicateWarning
        ? 'Emitir de todos modos'
        : 'Emitir factura';

  return (
    <Modal
      size="small"
      onClose={onClose}
      icon={<ReceiptIcon />}
      open={isOpen}
      setDisplay={onClose}
      title={alreadyHasInvoice ? 'Factura AFIP emitida' : 'Emitir Factura AFIP'}
      buttonText={primaryButtonText}
      onClick={primaryButtonAction}
      buttonDisabled={!alreadyHasInvoice && (isLoading || isMixedStudents)}
      hiddingButton={isMixedStudents}
    >
      {isMixedStudents && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          Los movimientos seleccionados corresponden a alumnos distintos. Una factura AFIP solo puede tener un alumno como receptor — ajustá la selección para que sea de un mismo alumno.
        </p>
      )}

      {alreadyHasInvoice && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-1">{invoiceDisplay.invoiceType} N° {invoiceDisplay.invoiceNumber}</p>
            <p className="text-sm text-green-700">CAE: <span className="font-mono">{invoiceDisplay.cae}</span></p>
            {invoiceDisplay.caeVencimiento && <p className="text-xs text-gray-500 mt-1">Vto. CAE: {invoiceDisplay.caeVencimiento}</p>}
          </div>
          <div className="flex gap-2 mt-1">
            <Tooltip title={studentEmail ? '' : 'El alumno no tiene correo registrado'} placement="top">
              <span className="flex-1">
                <button
                  onClick={handleSendEmail}
                  disabled={!studentEmail || isSendingEmail}
                  className="w-full flex items-center justify-center gap-2 border border-blue-400 text-blue-600 rounded px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isSendingEmail
                    ? <><i className="fa fa-circle-o-notch fa-spin" /><span>Enviando...</span></>
                    : <><EmailIcon fontSize="small" />Enviar por email{studentEmail ? ` (${studentEmail})` : ''}</>
                  }
                </button>
              </span>
            </Tooltip>
          </div>
        </div>
      )}

      {!isMixedStudents && !alreadyHasInvoice && payments.length > 0 && (
        <div className="flex flex-col gap-4">
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
                  onChange={(e) => handleIvaConditionChange(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                >
                  {IVA_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {ivaCondition === 'RESPONSABLE_INSCRIPTO' ? (
                <CommonInput
                  label="CUIT"
                  type="text"
                  placeholder="XX-XXXXXXXX-X"
                  value={cuit}
                  onChange={(e) => setCuit(formatCuit(e.target.value))}
                />
              ) : (
                <>
                  <div>
                    <Label htmlFor="doc-type-invoice">Tipo de documento</Label>
                    <select
                      id="doc-type-invoice"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-green-500 bg-white"
                    >
                      <option value="">Sin identificar</option>
                      <option value="DNI">DNI</option>
                      <option value="CUIT">CUIT</option>
                      <option value="CUIL">CUIL</option>
                    </select>
                  </div>
                  {docType === 'DNI' && (
                    <CommonInput
                      label="DNI"
                      type="text"
                      placeholder="12345678"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(formatDni(e.target.value))}
                    />
                  )}
                  {(docType === 'CUIT' || docType === 'CUIL') && (
                    <CommonInput
                      label={docType}
                      type="text"
                      placeholder="XX-XXXXXXXX-X"
                      value={cuit}
                      onChange={(e) => setCuit(formatCuit(e.target.value))}
                    />
                  )}
                </>
              )}

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-3">
                <Label>Movimientos a facturar</Label>
                {payments.map((p) => (
                  <div key={p.id} className="flex flex-col gap-2 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Pago #{p.id} {duplicateWarning?.includes(p.id) && <span className="text-amber-600 font-semibold ml-1">· ya facturado</span>}</span>
                      <span>{p.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <CommonInput
                        label="Monto"
                        type="number"
                        currency
                        value={itemState[p.id]?.amount ?? ''}
                        onChange={(e) => updateItemAmount(p.id, e.target.value)}
                      />
                      <CommonInput
                        label="Concepto"
                        type="text"
                        placeholder="Servicio"
                        value={itemState[p.id]?.concept ?? ''}
                        onChange={(e) => updateItemConcept(p.id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1 font-semibold text-gray-800">
                  <span>Total</span>
                  <span>{formatMoney(total)}</span>
                </div>
              </div>

              {duplicateWarning && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                  {duplicateWarning.length === 1 ? 'El movimiento' : 'Los movimientos'} #{duplicateWarning.join(', #')} ya {duplicateWarning.length === 1 ? 'tiene' : 'tienen'} una factura AFIP emitida. Podés continuar de todos modos o cerrar y ajustar la selección.
                </p>
              )}
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
