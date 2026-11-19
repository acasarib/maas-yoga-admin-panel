import React, { useState, useEffect, useContext } from 'react';
import Modal from '../modal';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CommonInput from '../commonInput';
import Label from '../label/label';
import paymentsService from '../../services/paymentsService';
import { Context } from '../../context/Context';
import DownloadIcon from '@mui/icons-material/Download';
import EmailIcon from '@mui/icons-material/Email';

const formatMoney = (n) => `$${(parseFloat(n) || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Modal para anular (total o parcialmente) una factura AFIP ya emitida, emitiendo una
 * Nota de Crédito asociada. No modifica el/los `payment` originales — es solo una
 * corrección fiscal (ver docs/plan de la feature).
 */
const NotaCreditoModal = ({ paymentId, isOpen, onClose, onSuccess }) => {
  const { changeAlertStatusAndMessage } = useContext(Context);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const [itemState, setItemState] = useState({});
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [error, setError] = useState(null);
  const [emittedData, setEmittedData] = useState(null);

  useEffect(() => {
    if (!isOpen || !paymentId) return;
    setError(null);
    setEmittedData(null);
    setIsLoadingDetail(true);
    paymentsService.getInvoiceForPayment(paymentId)
      .then((data) => {
        setDetail(data);
        const initialItems = {};
        data.items.forEach((it) => {
          initialItems[it.id] = { amount: it.remaining > 0 ? it.remaining : 0, concept: it.concept };
        });
        setItemState(initialItems);
      })
      .catch((e) => setError(e?.response?.data?.message || e?.message || 'Error al cargar la factura.'))
      .finally(() => setIsLoadingDetail(false));
  }, [isOpen, paymentId]);

  const updateItemAmount = (itemId, amount) => {
    setItemState((prev) => ({ ...prev, [itemId]: { ...prev[itemId], amount } }));
  };

  const itemsToCredit = (detail?.items || [])
    .map((it) => ({ ...it, amount: parseFloat(itemState[it.id]?.amount) || 0 }))
    .filter((it) => it.amount > 0);

  const total = itemsToCredit.reduce((sum, it) => sum + it.amount, 0);
  const hasInvalidAmount = (detail?.items || []).some((it) => {
    const amount = parseFloat(itemState[it.id]?.amount) || 0;
    return amount > it.remaining + 0.01;
  });

  const handleSubmit = async () => {
    if (itemsToCredit.length === 0) {
      setError('Ingresá al menos un monto a acreditar.');
      return;
    }
    if (hasInvalidAmount) {
      setError('Ningún monto puede superar el saldo acreditable del ítem.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const items = itemsToCredit.map((it) => ({ invoiceItemId: it.id, amount: it.amount, concept: it.concept }));
      const result = await paymentsService.emitirNotaCredito(paymentId, { items, reason });
      changeAlertStatusAndMessage(true, 'success', 'Nota de crédito emitida correctamente.');
      setEmittedData(result);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al emitir la nota de crédito.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => paymentsService.downloadCreditNotePDF(paymentId, emittedData.creditNoteId);

  const handleSendEmail = async () => {
    setIsSendingEmail(true);
    try {
      const res = await paymentsService.sendCreditNoteByEmail(paymentId, emittedData.creditNoteId);
      changeAlertStatusAndMessage(true, 'success', res?.message || 'Nota de crédito enviada por email.');
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Error al enviar el email.';
      changeAlertStatusAndMessage(true, 'error', msg);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <Modal
      size="small"
      onClose={onClose}
      icon={<ReceiptIcon />}
      open={isOpen}
      setDisplay={onClose}
      title={emittedData ? 'Nota de Crédito emitida' : 'Anular / Nota de Crédito'}
      buttonText={emittedData ? undefined : (isLoading ? 'Emitiendo...' : 'Emitir Nota de Crédito')}
      onClick={emittedData ? undefined : handleSubmit}
      buttonDisabled={isLoading || isLoadingDetail || itemsToCredit.length === 0 || hasInvalidAmount}
      hiddingButton={!!emittedData}
    >
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 mb-3">{error}</p>
      )}

      {isLoadingDetail && <p className="text-sm text-gray-500">Cargando factura...</p>}

      {emittedData && (
        <div className="flex flex-col gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-1">{emittedData.creditNoteType} N° {emittedData.creditNoteNumber}</p>
            <p className="text-sm text-green-700">CAE: <span className="font-mono">{emittedData.cae}</span></p>
            {emittedData.caeVencimiento && <p className="text-xs text-gray-500 mt-1">Vto. CAE: {emittedData.caeVencimiento}</p>}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 border border-emerald-400 text-emerald-700 rounded px-3 py-2 text-sm hover:bg-emerald-50 transition-colors"
            >
              <DownloadIcon fontSize="small" />Descargar PDF
            </button>
            <button
              onClick={handleSendEmail}
              disabled={isSendingEmail}
              className="flex-1 flex items-center justify-center gap-2 border border-blue-400 text-blue-600 rounded px-3 py-2 text-sm hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isSendingEmail
                ? <><i className="fa fa-circle-o-notch fa-spin" /><span>Enviando...</span></>
                : <><EmailIcon fontSize="small" />Enviar por email</>
              }
            </button>
          </div>
        </div>
      )}

      {!emittedData && detail && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-gray-500">
            Factura asociada: {detail.invoiceType} {String(detail.puntoVenta).padStart(4, '0')}-{String(detail.invoiceNumber).padStart(8, '0')}
          </p>

          <div className="flex flex-col gap-3">
            <Label>Ítems a acreditar</Label>
            {detail.items.map((it) => (
              <div key={it.id} className="flex flex-col gap-2 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{it.concept}</span>
                  <span>Saldo acreditable: {formatMoney(it.remaining)}</span>
                </div>
                <CommonInput
                  label="Monto a acreditar"
                  type="number"
                  currency
                  value={itemState[it.id]?.amount ?? ''}
                  onChange={(e) => updateItemAmount(it.id, e.target.value)}
                />
                {(parseFloat(itemState[it.id]?.amount) || 0) > it.remaining + 0.01 && (
                  <p className="text-xs text-red-600">No puede superar el saldo acreditable.</p>
                )}
              </div>
            ))}
            <div className="flex justify-between items-center pt-1 font-semibold text-gray-800">
              <span>Total a acreditar</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="credit-note-reason">Motivo</Label>
            <CommonInput
              id="credit-note-reason"
              type="text"
              placeholder="Ej: Error de carga, Devolución parcial..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {detail.creditNotes?.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <Label>Notas de crédito ya emitidas</Label>
              <div className="flex flex-col gap-1 mt-1">
                {detail.creditNotes.map((cn) => (
                  <div key={cn.id} className="text-xs text-gray-500 flex justify-between">
                    <span>{cn.creditNoteType} N° {cn.creditNoteNumber} {cn.reason ? `— ${cn.reason}` : ''}</span>
                    <span>{formatMoney(cn.totalAmount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default NotaCreditoModal;
