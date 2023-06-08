import React from "react";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';

export default function PlusButton({ onClick, className }) {
    
    return (
        <button
            onClick={onClick}
            className={`mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115 ${className}`}
        >
            <span className="font-bold text-sm text-yellow-900">
                <AddIcon fontSize="large" sx={{ color: orange[50] }} />
            </span>
        </button>
    );
} 