import React from "react";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

export default function NotificationIcon({ amount, onClick, innerRef }) {
    
    return (
        <div className="relative inline-flex w-fit">
            <div className={`absolute bottom-auto left-auto right-0 top-0 z-10 inline-flex items-center justify-center -translate-y-1/2 translate-x-2/4 w-5 h-5 rounded-full bg-red-500 text-xs text-white font-medium ${amount === 0 && "hidden"}`}>{amount}</div>
            <div ref={innerRef} className="flex items-center cursor-pointer justify-center rounded-lg text-center">
                <span className="[&>svg]:h-6 [&>svg]:w-6 block sm:hidden" onClick={onClick}>
                    <NotificationsNoneIcon/>
                </span>
                <span className="[&>svg]:h-8 [&>svg]:w-8 hidden sm:block" onClick={onClick}>
                    <NotificationsNoneIcon/>
                </span>
            </div>
        </div>
    );
} 