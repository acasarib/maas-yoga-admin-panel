import React from "react";
import { Link } from "react-router-dom";

export default function NavItem({ target, isActive, children, icon }) {

    return(
        <li className="grid place-content-stretch">
            <Link to={`/home/${target}`}>
                <span className={`${isActive ? "w-full bg-amber-600 text-white" : "w-11/12 bg-orange-50 text-yellow-900 hover:bg-orange-100 shadow-lg"} flex items-center rounded-xl font-bold text-sm py-3 px-4`}>
                    {icon}<span className="ml-3">{children}</span>
                </span>
            </Link>
        </li>
    );
} 