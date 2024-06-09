import React from "react";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

export default function NotificationIcon({ amount, onClick }) {
    
    return (
        <div className="relative inline-flex w-fit">
            <div className={`absolute bottom-auto left-auto right-0 top-0 z-10 inline-block -translate-y-1/2 translate-x-2/4 rotate-0 skew-x-0 skew-y-0 scale-x-100 scale-y-100 rounded-full bg-pink-700 p-2.5 text-xs text-white ${amount == 0 && "hidden"}`}>{amount}</div>
            <div className="flex items-center cursor-pointer justify-center rounded-lg text-center">
                <span className="[&>svg]:h-8 [&>svg]:w-8" onClick={onClick}>
                    <NotificationsNoneIcon/>
                </span>
            </div>
        </div>
    );
} 