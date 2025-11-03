import React, { useEffect, useRef, useContext } from "react";
import { Context } from "../../context/Context";
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { elapsedTime, formatDateMonthDayHourMinutes } from "../../utils";

export default function NotificationDropdown({ className, isOpen, onClose, buttonRef }) {
    const { notifications, removeNotification, clearNotifications } = useContext(Context);
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const notificationWidth = 350

    const onClear = async () => {
        clearNotifications()
        onClose()
    }

    useEffect(() => {
        if (isOpen && buttonRef.current && modalRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect();
            modalRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
            modalRef.current.style.left = `${buttonRect.left + window.scrollX}px`;
        }
    }, [isOpen, buttonRef]);

    const getUserFullName = user => {
        if (user == null || user.firstName == null || user.lastName == null) {
            return "Sistema"
        }
        return `${user.firstName} ${user.lastName}`
    }

    const onClickNotification = async (notification) => {
        await removeNotification(notification.id)
        onClose();

        navigate(`/home/payments?id=${notification.paymentId}`);
    }

    return (
        <>
            {/* Desktop dropdown (hidden on mobile) */}
            {isOpen && (
                <div className="hidden md:block">
                    <div ref={modalRef} style={{width: `${notificationWidth}px`, marginLeft: `-${notificationWidth/2}px`}} className={`${className} absolute bg-white rounded-lg shadow-lg w-96 z-10`}>
                        <div className="flex justify-between items-center p-6">
                            {notifications.length === 0 ? 
                                <span>Sin notificaciones</span>
                            :
                                <button className="text-blue-500 underline" onClick={onClear}>
                                    Marcar todo como leido
                                </button>
                            }
                            <button className="text-gray-600" onClick={onClose}>
                                <CloseIcon/>
                            </button>
                        </div>
                        <hr className="border-gray-200" />
                        <div className="space-y-2">
                            {notifications.map(notification => 
                                <div key={notification.id} onClick={() => onClickNotification(notification)} className="cursor-pointer hover:bg-slate-100 py-2 px-6">
                                    <p><span className="font-semibold">{getUserFullName(notification.payment.user)}</span> agrego un pago</p>
                                    <p className="text-gray-500 flex justify-between w-full"><span>{formatDateMonthDayHourMinutes(notification.createdAt)}</span><span>{elapsedTime(notification.createdAt)}</span></p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile drawer */}
            {/* Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/30 md:hidden z-40" onClick={onClose}></div>
            )}
            <div className={`fixed md:hidden inset-y-0 right-0 z-50 bg-white shadow-lg w-11/12 max-w-sm transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex justify-between items-center p-4 border-b">
                    {notifications.length === 0 ? 
                        <span className="font-semibold">Notificaciones</span>
                    :
                        <button className="text-blue-500 underline" onClick={onClear}>
                            Marcar todo como leido
                        </button>
                    }
                    <button className="text-gray-600" onClick={onClose}>
                        <CloseIcon/>
                    </button>
                </div>
                <div className="overflow-y-auto h-full pb-10">
                    {notifications.length === 0 ? (
                        <div className="p-6">Sin notificaciones</div>
                    ) : (
                        <div className="space-y-2">
                            {notifications.map(notification => (
                                <div key={notification.id} onClick={() => onClickNotification(notification)} className="cursor-pointer hover:bg-slate-100 py-3 px-4">
                                    <p><span className="font-semibold">{getUserFullName(notification.payment.user)}</span> agrego un pago</p>
                                    <p className="text-gray-500 flex justify-between w-full"><span>{formatDateMonthDayHourMinutes(notification.createdAt)}</span><span>{elapsedTime(notification.createdAt)}</span></p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
;