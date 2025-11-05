import React, { useState } from "react";
import { Link } from "react-router-dom";
import { COLORS } from "../constants";

export default function NavItem({ target, isActive, onClick, children, icon }) {

    const [hovered, setHovered] = useState(false);

    const bgColor = isActive ? COLORS.primary[600] : (hovered ? COLORS.primary[100] : COLORS.primary[50]);
    const textColor = isActive ? 'white' : COLORS.primary[900];

    return(
        <li onClick={onClick} className="grid place-content-stretch">
            <Link to={`/home/${target}`}>
                <span
                    onMouseEnter={() => setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    style={{ color: textColor, backgroundColor: bgColor }}
                    className={`${isActive ? `w-full text-white` : "w-11/12 shadow-lg"} transition-colors duration-150 flex items-center rounded-xl font-bold text-sm py-2.5 px-4`}
                >
                    {icon}<span className="ml-3">{children}</span>
                </span>
            </Link>
        </li>
    );
}