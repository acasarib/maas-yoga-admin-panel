import React, { useState } from "react";
import { Link } from "react-router-dom";
import { COLORS } from "../constants";
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
    const [hoveredMain, setHoveredMain] = useState(false);
    const [hoveredSubIndex, setHoveredSubIndex] = useState(-1);

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
                onMouseEnter={() => setHoveredMain(true)}
                onMouseLeave={() => setHoveredMain(false)}
                style={{
                    backgroundColor: isActive ? COLORS.primary[600] : (hoveredMain ? COLORS.primary[100] : COLORS.primary[50]),
                    color: isActive ? 'white' : COLORS.primary[900],
                }}
                className={`${isActive ? "w-full text-white" : "w-11/12 shadow-lg"} transition-colors duration-150 flex items-center justify-between rounded-xl font-bold text-sm py-3 px-4 cursor-pointer`}
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
                                <span
                                    onMouseEnter={() => setHoveredSubIndex(index)}
                                    onMouseLeave={() => setHoveredSubIndex((prev) => (prev === index ? -1 : prev))}
                                    style={{
                                        backgroundColor: subitem.isActive ? COLORS.primary[500] : ((hoveredSubIndex === index) ? COLORS.primary[200] : COLORS.primary[100]),
                                        color: subitem.isActive ? 'white' : COLORS.primary[900],
                                    }}
                                    className={`${subitem.isActive ? "w-full text-white" : "w-11/12 shadow-sm"} transition-colors duration-150 flex items-center rounded-lg font-medium text-sm py-2 px-3 ml-2`}
                                >
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
