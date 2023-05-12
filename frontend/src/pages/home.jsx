import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaidIcon from '@mui/icons-material/Paid';
import BalanceIcon from '@mui/icons-material/Balance';
import CategoryIcon from '@mui/icons-material/Category';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import Payments from "./payments";
import Balance from "./balance";
import Tasks from "./tasks";
import NewUser from "./newUser";
import Classes from "./classes";
import Colleges from "./colleges";
import Students from "./students";
import Courses from "./courses";
import Categories from "./categories";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { Context } from "../context/Context";
import NavItem from "../components/navItem";
import AlertPortal from "../components/statusAlert";

export default function Home(props) {
    const { setUser } = useContext(Context);
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);

    let navigate = useNavigate();

    useEffect(() => {
        var dt = new Date();
        let year  = dt.getFullYear();
        let month = (dt.getMonth() + 1).toString().padStart(2, "0");
        let day   = dt.getDate().toString().padStart(2, "0");
        var date = day + '/' + month + '/' + year;
        setDate(date);
        getDay(); 
    }, []);

    const getDay = () => {
        const date = new Date();
        const day = date.toString().slice(0, 3);
        const days = {
            Mon: 'Lunes',
            Tue: 'Martes',
            Wed: 'Miércoles',
            Thu: 'Jueves',
            Fri: 'Viernes',
            Sat: 'Sábado',
            Sun: 'Domingo'
        }
        setDay(days[day]);
    };

    const closeSession = () => {
        localStorage.removeItem('accessToken');
        navigate('/');
    };

    useEffect(() => {
        if(!localStorage.getItem('accessToken')) {
            navigate('/');
        }
        if(localStorage.getItem('userInfo')) {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            setUser(userInfo);
            if(userInfo.permissions[0] === 'PERMISSION_CREATE_USER') {
                setIsMasterAdmin(true);
            }
        }
    }, [])

    return(
        <>
            <div>
                <body className="relative bg-orange-50 h-screen overflow-y-auto max-h-screen">
                <header className="fixed right-0 top-0 z-10 left-60 bg-orange-100 py-3 px-4 h-24">
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

                <aside className="fixed overflow-y-auto inset-y-0 left-0 bg-white shadow-md max-h-screen w-64">
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
                            <NavItem target={"payments"} isActive={props.payments} icon={<PaidIcon/>}>Movimientos</NavItem>
                            <NavItem target={"tasks"} isActive={props.tasks} icon={<AssignmentIcon/>}>Tareas pendientes</NavItem>
                            <NavItem target={"balance"} isActive={props.balance} icon={<BalanceIcon/>}>Balance</NavItem>
                            <NavItem target={"students"} isActive={props.students} icon={<SchoolIcon/>}>Alumnos</NavItem>
                            <NavItem target={"colleges"} isActive={props.colleges} icon={<AccountBalanceIcon/>}>Sedes</NavItem>
                            <NavItem target={"courses"} isActive={props.courses} icon={<LocalLibraryIcon/>}>Cursos</NavItem>
                            <NavItem target={"classes"} isActive={props.classes} icon={<HistoryEduIcon/>}>Clases</NavItem>
                            <NavItem target={"categories"} isActive={props.categories} icon={<CategoryIcon/>}>Rubros</NavItem>
                            {isMasterAdmin && (<NavItem target={"new-user"} isActive={props.newUser} icon={<PersonAddIcon/>}>Agregar usuario</NavItem>)}
                        </ul>
                        </div>
                    </div>
                    <div className="p-4">
                        <button onClick={() => closeSession()} className="inline-flex items-center justify-center h-9 px-4 rounded-xl bg-gray-900 text-gray-300 hover:text-white text-sm font-semibold transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" className="" viewBox="0 0 16 16">
                            <path d="M12 1a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3V2a1 1 0 0 1 1-1h8zm-2 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                        </button> <span className="font-bold text-sm ml-2">Salir</span>
                    </div>
                    </div>
                </aside>

                <main className="relative ml-60 pt-16 max-h-screen overflow-auto">
                    <span className="absolute right-0 top-0"><AlertPortal /></span>
                    {props.payments && (<><Payments/></>)}
                    {props.newUser && (<><NewUser/></>)}
                    {props.tasks && (<><Tasks/></>)}
                    {props.balance && (<><Balance/></>)}
                    {props.classes && (<><Classes/></>)}
                    {props.colleges && (<><Colleges /></>)}
                    {props.courses && (<><Courses/></>)}
                    {props.students && (<><Students/></>)}
                    {props.categories && (<><Categories/></>)}
                </main>
                </body>
            </div>
        </>
    );
} 