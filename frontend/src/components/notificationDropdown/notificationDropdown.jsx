import React, { useEffect, useState, useRef, useContext } from "react";
import { Context } from "../../context/Context";
import CloseIcon from '@mui/icons-material/Close';
import {Routes, Route, useNavigate} from 'react-router-dom';
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

    if (!isOpen) return null;

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
        <div ref={modalRef} style={{width: `${notificationWidth}px`, marginLeft: `-${notificationWidth/2}px`}} className={`${className} absolute bg-white rounded-lg shadow-lg w-96 z-10`}>
            <div className="flex justify-between items-center mb-4 p-6">
                <button className="text-blue-500 underline" onClick={onClear}>
                Marcar todo como leido
                </button>
                <button className="text-gray-600" onClick={onClose}>
                    <CloseIcon/>
                </button>
            </div>
            <div className="space-y-2">
                {notifications.map(notification => 
                    <div key={notification.id} onClick={() => onClickNotification(notification)} className="cursor-pointer hover:bg-slate-100 py-2 px-6">
                        <p><span className="font-semibold">{getUserFullName(notification.payment.user)}</span> agrego un pago</p>
                        <p className="text-gray-500 flex justify-between w-full"><span>{formatDateMonthDayHourMinutes(notification.createdAt)}</span><span>{elapsedTime(notification.createdAt)}</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};