import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaidIcon from '@mui/icons-material/Paid';
import BalanceIcon from '@mui/icons-material/Balance';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Payments from "./payments";
import Balance from "./balance";
import Tasks from "./tasks";
import NewUser from "./newUser";
import Calendar from "./calendar";

export default function Home() {
    const [date, setDate] = useState('');
    const [options, setOptions] = useState({
        payments: false,
        tasks: false,
        balance: false,
        calendar: false,
        newUser: false
    });

    useEffect(() => {
        var dt = new Date();
        let year  = dt.getFullYear();
        let month = (dt.getMonth() + 1).toString().padStart(2, "0");
        let day   = dt.getDate().toString().padStart(2, "0");
        var date = day + '/' + month + '/' + year;
        setDate(date);
    }, []);

    return(
        <>
            <div>
                <body className="relative bg-yellow-100 h-screen overflow-hidden max-h-screen">
                <header className="fixed right-0 top-0 left-60 bg-yellow-200 py-3 px-4 h-24">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center justify-between">
                        <div>
                                <button type="button" className="flex items-center focus:outline-none rounded-lg text-gray-600 hover:text-yellow-600 focus:text-yellow-600 font-semibold p-2 border border-transparent hover:border-yellow-300 focus:border-yellow-300 transition">
                                    <span className="text-sm">{date}</span>
                                </button>
                            </div>
                            <img
                                src="\assets\images\maas_3colores.png"
                                width={149}
                                height={50}
                                alt="Maas Yoga logo"
                                className="mb-8 mx-auto"
                            />
                            <div>
                                <button type="button" className="flex items-center focus:outline-none rounded-lg text-gray-600 hover:text-yellow-600 focus:text-yellow-600 font-semibold p-2 border border-transparent hover:border-yellow-300 focus:border-yellow-300 transition">
                                    <span className="text-sm">{date}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <aside className="fixed inset-y-0 left-0 bg-white shadow-md max-h-screen w-60">
                    <div className="flex flex-col justify-between h-full">
                    <div className="flex-grow">
                        <div className="px-4 py-6 text-center border-b">
                        <h1 className="text-xl font-bold leading-none"><span className="text-purple-950">Maas </span><span className="text-orange-550">Yoga</span><br/>Admin panel</h1>
                        </div>
                        <div className="p-4">
                        <ul className="space-y-1">
                            <li>
                                <button onClick={() => setOptions(Object.fromEntries(Object.entries(options)
                                    .map(([key, value]) => [key, key === 'payments' ? true : false])))}>
                                    <span className="flex items-center bg-yellow-200 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4">
                                        <PaidIcon /><span className="ml-3">Pagos</span>
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setOptions(Object.fromEntries(Object.entries(options)
                                    .map(([key, value]) => [key, key === 'tasks' ? true : false])))}>
                                    <span className="flex bg-white hover:bg-yellow-50 rounded-xl font-bold text-sm text-gray-900 py-3 px-4">
                                        <AssignmentIcon /><span className="ml-3">Tareas pendientes</span>
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setOptions(Object.fromEntries(Object.entries(options)
                                    .map(([key, value]) => [key, key === 'balance' ? true : false])))}>
                                    <span className="flex bg-white hover:bg-yellow-50 rounded-xl font-bold text-sm text-gray-900 py-3 px-4">
                                        <BalanceIcon /><span className="ml-3">Balance</span>
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setOptions(Object.fromEntries(Object.entries(options)
                                    .map(([key, value]) => [key, key === 'calendar' ? true : false])))}>
                                    <span className="flex bg-white hover:bg-yellow-50 rounded-xl font-bold text-sm text-gray-900 py-3 px-4">
                                        <CalendarMonthIcon /><span className="ml-3">Calendario</span>
                                    </span>
                                </button>
                            </li>
                            <li>
                                <button onClick={() => setOptions(Object.fromEntries(Object.entries(options)
                                    .map(([key, value]) => [key, key === 'newUser' ? true : false])))}>
                                    <span className="flex bg-white hover:bg-yellow-50 rounded-xl font-bold text-sm text-gray-900 py-3 px-4">
                                        <PersonAddIcon /><span className="ml-3">Agregar usuario</span>
                                    </span>
                                </button>
                            </li>
                        </ul>
                        </div>
                    </div>
                    <div className="p-4">
                        <button type="button" className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="" viewBox="0 0 16 16">
                            <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                        </button> <span className="font-bold text-sm ml-2">Salir</span>
                    </div>
                    </div>
                </aside>

                <main className="ml-60 pt-16 max-h-screen overflow-auto">
                    <div className="px-6 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                            {options.payments && (<><Payments /></>)}
                            {options.newUser && (<><NewUser /></>)}
                            {options.tasks && (<><Tasks /></>)}
                            {options.calendar && (<><Calendar /></>)}
                            {options.balance && (<><Balance /></>)}
                        <hr className="my-10"/>

                        </div>
                    </div>
                    </div>
                </main>
                </body>
            </div>
        </>
    );
} 