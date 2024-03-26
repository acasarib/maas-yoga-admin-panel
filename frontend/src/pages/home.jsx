import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaidIcon from '@mui/icons-material/Paid';
import BalanceIcon from '@mui/icons-material/Balance';
import CategoryIcon from '@mui/icons-material/Category';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import Payments from "./payments";
import Balance from "./balance";
import Tasks from "./tasks";
import NewUser from "./newUser";
import Classes from "./classes";
import Colleges from "./colleges";
import Diary from "./diary";
import Students from "./students";
import Courses from "./courses";
import Professors from "./professors";
import Categories from "./categories";
import Imports from "./imports";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { Context } from "../context/Context";
import NavItem from "../components/navItem";
import AlertPortal from "../components/snackBar";
import GroupIcon from '@mui/icons-material/Group';
import HamburgerButton from "../components/button/hanmburger";
import ProfessorPayments from "./professorPayments";
import HailIcon from '@mui/icons-material/Hail';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ProfessorDetail from "./professorDetail";

export default function Home(props) {
    const { setUser } = useContext(Context);
    const [isOpenSidebar, setIsOpenSidebar] = useState(false);
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

    const openSidebar = () => setIsOpenSidebar(true);
    const closeSidebar = () => setIsOpenSidebar(false);

    const maasYogaTextColor = (<><span className="text-purple-950">Maas </span><span className="text-orange-550">Yoga</span></>)

    return(
        <>
            <div>
                <div className="relative bg-orange-50 h-screen overflow-y-auto max-h-screen">
                <header className="fixed right-0 top-0 z-10 md:left-60 bg-orange-100 py-3 px-4 h-24">
                    <div className="max-w-4xl mx-auto mt-4 md:mt-2">
                        <div className="flex items-center justify-between">
                            <div className="md:hidden my-auto">
                                <HamburgerButton onClick={openSidebar}/>
                            </div>
                            <div className="hidden ml-2 md:block my-auto">
                                <button className="flex items-center rounded-lg text-gray-600 hover:text-yellow-600  font-semibold p-2 border border-yellow-400 focus:border-yellow-300 transition">
                                    <span className="text-md text-orange-550">{day}</span>
                                </button>
                            </div>
                            <h1 className="md:text-xl md:ml-0 ml-12 font-bold leading-none text-center">{maasYogaTextColor}<br/>Admin panel</h1>
                            <div>
                                <span className="flex items-center rounded-lg text-gray-600 hover:text-yellow-600  font-semibold p-2 border border-yellow-400 focus:border-yellow-300 transition">
                                    <span className="text-sm md:text-md text-orange-550">{date}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <aside className={`${isOpenSidebar ? "translate-x-0 w-full sm:w-5/12" : "-translate-x-full"} md:translate-x-0 md:w-64 z-50 transition-transform fixed overflow-y-auto inset-y-0 left-0 bg-white shadow-md max-h-screen`}>
                    <div className="flex flex-col justify-between h-full">
                        <div className="flex-grow">
                            <div className="px-4 py-8 text-center border-b bg-orange-100">
                                <div className="md:hidden flex w-full justify-between items-center">
                                    <div className="flex items-center">
                                        <img
                                            src="\pngegg.png"
                                            width={36}
                                            height={36}
                                            alt="Maas Yoga logo"
                                            className="mx-auto"
                                        />
                                        <h1 className="ml-2 text-xl">{maasYogaTextColor}</h1>
                                    </div>
                                    <CloseIcon className="cursor-pointer" onClick={closeSidebar}/>
                                </div>
                                <img
                                    src="\assets\images\maas-yoga-desktop-logo-low.png"
                                    width={149}
                                    height={50}
                                    alt="Maas Yoga logo"
                                    className="mx-auto hidden md:block"
                                />
                            </div>
                            <div className="p-4">
                            <ul className="space-y-1">
                                <NavItem onClick={closeSidebar} target={"payments"} isActive={props.payments || props.professorPayments} icon={<PaidIcon/>}>Movimientos</NavItem>
                                <NavItem onClick={closeSidebar} target={"tasks"} isActive={props.tasks} icon={<AssignmentIcon/>}>Tareas pendientes</NavItem>
                                <NavItem onClick={closeSidebar} target={"balance"} isActive={props.balance} icon={<BalanceIcon/>}>Balance</NavItem>
                                <NavItem onClick={closeSidebar} target={"students"} isActive={props.students} icon={<SchoolIcon/>}>Alumnos</NavItem>
                                <NavItem onClick={closeSidebar} target={"colleges"} isActive={props.colleges} icon={<AccountBalanceIcon/>}>Sedes</NavItem>
                                <NavItem onClick={closeSidebar} target={"professors"} isActive={props.professors || props.professorDetail} icon={<HailIcon/>}>Profesores</NavItem>
                                <NavItem onClick={closeSidebar} target={"courses"} isActive={props.courses} icon={<LocalLibraryIcon/>}>Cursos</NavItem>
                                <NavItem onClick={closeSidebar} target={"classes"} isActive={props.classes} icon={<HistoryEduIcon/>}>Clases</NavItem>
                                <NavItem onClick={closeSidebar} target={"categories"} isActive={props.categories} icon={<CategoryIcon/>}>Rubros</NavItem>
                                <NavItem onClick={closeSidebar} target={"imports"} isActive={props.imports} icon={<ImportExportIcon/>}>Importar datos</NavItem>
                                <NavItem onClick={closeSidebar} target={"diary"} isActive={props.diary} icon={<MenuBookIcon/>}>Agenda</NavItem>
                                {isMasterAdmin && (<NavItem onClick={closeSidebar} target={"new-user"} isActive={props.newUser} icon={<GroupIcon/>}>Usuarios</NavItem>)}
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

                <main className="relative md:ml-60 pt-16 max-h-screen overflow-auto">
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
                    {props.imports && (<><Imports/></>)}
                    {props.diary && (<><Diary/></>)}
                    {props.professorPayments && (<><ProfessorPayments/></>)}
                    {props.professorDetail && (<><ProfessorDetail/></>)}
                    {props.professors && (<><Professors/></>)}
                </main>
                </div>
            </div>
        </>
    );
} 