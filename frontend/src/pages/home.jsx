import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
    const [day, setDay] = useState('');
    const [options, setOptions] = useState({
        payments: true,
        tasks: false,
        balance: false,
        calendar: false,
        newUser: false
    });
    //let navigate = useNavigate();

    useEffect(() => {
        var dt = new Date();
        let year  = dt.getFullYear();
        let month = (dt.getMonth() + 1).toString().padStart(2, "0");
        let day   = dt.getDate().toString().padStart(2, "0");
        var date = day + '/' + month + '/' + year;
        setDate(date);
        getDay();
    }, []);

    const switchOption = (option) => {
        setOptions(Object.fromEntries(Object.entries(options).map(([key, value]) => [key, key === option ? true : false])))
    };

    const getDay = () => {
        const date = new Date();
        const day = date.toString().slice(0, 3);
        console.log(day)
        const days = {
            Mon: 'Lunes',
            Tue: 'Martes',
            Wed: 'Miércoles',
            thu: 'Jueves',
            Fri: 'Viernes',
            Sat: 'Sábado',
            Sun: 'Domingo'
        }
        setDay(days[day]);
    };

    /*const closeSession = () => {
        localStorage.removeItem('accessToken');
        navigate('/');
    };*/

    return(
        <>
            <div>
                <body className="relative bg-orange-50 h-screen overflow-hidden max-h-screen">
                <header className="fixed right-0 top-0 left-60 bg-orange-100 py-3 px-4 h-24">
                    <div className="max-w-4xl mx-auto mt-4">
                        <div className="flex items-center justify-between">
                        <div className="my-auto">
                                <button className="flex items-center rounded-lg text-gray-600 hover:text-yellow-600  font-semibold p-2 border border-yellow-400 focus:border-yellow-300 transition">
                                    <span className="text-md text-orange-550">{day}</span>
                                </button>
                            </div>
                            <h1 className="text-xl font-bold leading-none text-center"><span className="text-purple-950">Maas </span><span className="text-orange-550">Yoga</span><br/>Admin panel</h1>
                            <div>
                                <span className="flex items-center rounded-lg text-gray-600 hover:text-yellow-600  font-semibold p-2 border border-yellow-400 focus:border-yellow-300 transition">
                                    <span className="text-md text-orange-550">{date}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <aside className="fixed inset-y-0 left-0 bg-white shadow-md max-h-screen w-60">
                    <div className="flex flex-col justify-between h-full">
                    <div className="flex-grow">
                        <div className="px-4 py-8 text-center border-b bg-orange-100">
                       <img
                                src="\assets\images\maas_3colores.png"
                                width={149}
                                height={50}
                                alt="Maas Yoga logo"
                                className="mx-auto"
                            />
                        </div>
                        <div className="p-4">
                        <ul className="space-y-1">
                            <li className="grid place-content-stretch">
                                <button onClick={() => switchOption('payments')}>
                                    <span className={options.payments ? "flex items-center bg-orange-550 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4" : "flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100"}>
                                        <PaidIcon /><span className="ml-3">Pagos</span>
                                    </span>
                                </button>
                            </li>
                            <li className="grid place-content-stretch">
                                <button onClick={() => switchOption('tasks')}>
                                    <span className={options.tasks ? "flex items-center bg-orange-550 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4" : "flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100"}>
                                        <AssignmentIcon /><span className="ml-3">Tareas pendientes</span>
                                    </span>
                                </button>
                            </li>
                            <li className="grid place-content-stretch">
                                <button onClick={() => switchOption('balance')}>
                                    <span className={options.balance ? "flex items-center bg-orange-550 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4" : "flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100"}>
                                        <BalanceIcon /><span className="ml-3">Balance</span>
                                    </span>
                                </button>
                            </li>
                            <li className="grid place-content-stretch">
                                <button onClick={() => switchOption('calendar')}>
                                    <span className={options.calendar ? "flex items-center bg-orange-550 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4" : "flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100"}>
                                        <CalendarMonthIcon /><span className="ml-3">Calendario</span>
                                    </span>
                                </button>
                            </li>
                            <li className="grid place-content-stretch">
                                <button onClick={() => switchOption('newUser')}>
                                    <span className={options.newUser ? "flex items-center bg-orange-550 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4" : "flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100"}>
                                        <PersonAddIcon /><span className="ml-3">Agregar usuario</span>
                                    </span>
                                </button>
                            </li>
                        </ul>
                        </div>
                    </div>
                    <div className="p-4">
                        <Link to="/" className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="" viewBox="0 0 16 16">
                            <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                        </Link> <span className="font-bold text-sm ml-2">Salir</span>
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