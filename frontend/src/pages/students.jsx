import React from "react";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';

export default function Students(props) {

    const white = orange[50];

    return(
        <>
            <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Alumnos</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Alumnos</p>
                    <p>Alumnos</p>
                </div>
                <div className="flex justify-end">
                    <button onclick={props.onClick}
                            class="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
            </div>    
        </>
    );
} 