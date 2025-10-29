import React, { useState } from "react";
import { Link } from "react-router-dom";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

export default function NavItemWithSubitems({ 
    isActive, 
    onClick, 
    children, 
    icon, 
    subitems = [],
    expandedByDefault = false 
}) {
    const [isExpanded, setIsExpanded] = useState(expandedByDefault);

    const toggleExpanded = (e) => {
        e.preventDefault();
        setIsExpanded(!isExpanded);
    };

    const handleSubitemClick = () => {
        if (onClick) onClick();
    };

    return (
        <li className="grid place-content-stretch">
            {/* Item principal */}
            <div 
                onClick={toggleExpanded}
                className={`${isActive ? "w-full bg-amber-600 text-white" : "w-11/12 bg-orange-50 text-yellow-900 hover:bg-orange-100 shadow-lg"} flex items-center justify-between rounded-xl font-bold text-sm py-3 px-4 cursor-pointer`}
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ml-3">{children}</span>
                </div>
                <div className="ml-2">
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </div>
            </div>

            {/* Subitems */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <ul className="ml-4 mt-2 space-y-1">
                    {subitems.map((subitem, index) => (
                        <li key={index} onClick={handleSubitemClick} className="grid place-content-stretch">
                            <Link to={`/home/${subitem.target}`}>
                                <span className={`${subitem.isActive ? "w-full bg-amber-500 text-white" : "w-11/12 bg-orange-100 text-yellow-800 hover:bg-orange-200 shadow-sm"} flex items-center rounded-lg font-medium text-sm py-2 px-3 ml-2`}>
                                    {subitem.icon && <span className="mr-2">{subitem.icon}</span>}
                                    <span>{subitem.label}</span>
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </li>
    );
}
