import React from "react";
import MenuIcon from '@mui/icons-material/Menu';

export default function HamburgerButton({ onClick, className }) {

    return (
    <button onClick={onClick} className={`${className}`}>
        <MenuIcon/>
     </button>);
} 