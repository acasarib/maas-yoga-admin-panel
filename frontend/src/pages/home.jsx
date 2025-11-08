import React, { useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaidIcon from '@mui/icons-material/Paid';
import BalanceIcon from '@mui/icons-material/Balance';
import CategoryIcon from '@mui/icons-material/Category';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { esES } from '@mui/x-date-pickers/locales';
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
import ConsultaPagos from "./consultaPagos";
import Services from "./services";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { Context } from "../context/Context";
import NavItem from "../components/navItem";
import NavItemWithSubitems from "../components/navItemWithSubitems";
import AlertPortal from "../components/snackBar";
import GroupIcon from '@mui/icons-material/Group';
import HamburgerButton from "../components/button/hanmburger";
import ProfessorPayments from "./professorPayments";
import ProfessorPaymentCalculation from "./professorPaymentCalculation";
import HailIcon from '@mui/icons-material/Hail';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PaymentIcon from '@mui/icons-material/Payment';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import ProfessorDetail from "./professorDetail";
import CourseDetail from "./courseDetail";
import StudentDetail from "./studentDetail";
import NotificationIcon from "../components/badget/notification";
import NotificationDropdown from "../components/notificationDropdown/notificationDropdown";
import useToggle from "../hooks/useToggle";
import { COLORS } from '../constants';
 
export default function Home(props) {
    const { setUser, notifications } = useContext(Context);
    const [isOpenSidebar, setIsOpenSidebar] = useState(false);
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const isNotificationsOpen = useToggle()
    const [isMasterAdmin, setIsMasterAdmin] = useState(false);
    const notificationIconRef = useRef(null)

    let navigate = useNavigate();

    const theme = createTheme({
        palette: {
          primary: {
            main: COLORS.primary[500],
          },
          secondary: {
            // This is green.A700 as hex.
            main: '#11cb5f',
          },
        },
    }, esES);

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

    const maasYogaTextColor = (<><span className="text-purple-950 mr-1 sm:mr-0">Maas </span><span style={{ color: COLORS.primary[550] }}>Yoga</span></>)

    return(
        <ThemeProvider theme={theme}>
            <div>
                <div style={{ backgroundColor: COLORS.primary[50] }} className="relative h-screen max-h-screen">
                <header style={{ backgroundColor: COLORS.primary[100] }} className="fixed right-0 top-0 z-20 md:left-60 py-3 px-4 sm:h-24">
                    <div className="max-w-4xl mx-auto sm:mt-4 md:mt-2">
                        <div className="flex items-center justify-between">
                            <div className="md:hidden my-auto">
                                <HamburgerButton onClick={openSidebar}/>
                            </div>
                            <div className="hidden ml-2 md:block my-auto">
                                <span style={{ borderColor: COLORS.primary[550] }} className="flex items-center rounded-lg text-gray-600  font-semibold p-2 border">
                                    <span className="text-md" style={{ color: COLORS.primary[550] }}>{day}</span>
                                </span>
                            </div>
                            <h1 className="md:text-xl md:ml-0 sm:ml-12 font-bold leading-none text-center">
                                <span className="flex items-center sm:block">
                                    <img
                                        src="\pngegg.png"
                                        width={24}
                                        height={24}
                                        alt="Maas Yoga logo"
                                        className="sm:hidden mx-auto mr-2"
                                    />
                                    {maasYogaTextColor}
                                </span>
                                <span className="hidden sm:block">Admin panel</span></h1>
                            <div>
                                <div className="flex">
                                    <span style={{ borderColor: COLORS.primary[550] }} className="hidden sm:block flex items-center rounded-lg text-gray-600 font-semibold p-2 border">
                                        <span className="text-sm md:text-md" style={{ color: COLORS.primary[550] }}>{date}</span>
                                    </span>
                                    <span className="text-sm md:text-md pl-2" style={{ color: COLORS.primary[550] }}><NotificationIcon innerRef={notificationIconRef} amount={notifications.length} onClick={isNotificationsOpen.toggle}/></span>
                                    <NotificationDropdown
                                        isOpen={isNotificationsOpen.value}
                                        onClose={isNotificationsOpen.toggle}
                                        className="mt-8"
                                        buttonRef={notificationIconRef}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <aside className={`${isOpenSidebar ? "translate-x-0 w-full sm:w-5/12" : "-translate-x-full"} md:translate-x-0 md:w-64 z-50 transition-transform fixed overflow-y-auto inset-y-0 left-0 bg-white shadow-md max-h-screen`}>
                    <div className="flex flex-col justify-between h-full">
                        <div className="flex-grow">
                            <div style={{ backgroundColor: COLORS.primary[100] }} className="px-4 py-4 sm:py-8 text-center border-b">
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
                                <NavItem onClick={closeSidebar} target={"payments"} isActive={props.payments || props.professorPayments} icon={<PaidIcon sx={{ fontSize: 20 }}/>}>Movimientos</NavItem>
                                <NavItem onClick={closeSidebar} target={"tasks"} isActive={props.tasks} icon={<AssignmentIcon sx={{ fontSize: 20 }}/>}>Tareas pendientes</NavItem>
                                <NavItem onClick={closeSidebar} target={"balance"} isActive={props.balance} icon={<BalanceIcon sx={{ fontSize: 20 }}/>}>Balance</NavItem>
                                <NavItem onClick={closeSidebar} target={"students"} isActive={props.students|| props.studentDetail} icon={<SchoolIcon sx={{ fontSize: 20 }}/>}>Alumnos</NavItem>
                                <NavItem onClick={closeSidebar} target={"colleges"} isActive={props.colleges} icon={<AccountBalanceIcon sx={{ fontSize: 20 }}/>}>Sedes</NavItem>
                                <NavItem onClick={closeSidebar} target={"professors"} isActive={props.professors || props.professorDetail} icon={<HailIcon sx={{ fontSize: 20 }}/>}>Profesores</NavItem>
                                <NavItem onClick={closeSidebar} target={"courses"} isActive={props.courses || props.courseDetail} icon={<LocalLibraryIcon sx={{ fontSize: 20 }}/>}>Cursos</NavItem>
                                <NavItem onClick={closeSidebar} target={"classes"} isActive={props.classes} icon={<HistoryEduIcon sx={{ fontSize: 20 }}/>}>Clases</NavItem>
                                <NavItem onClick={closeSidebar} target={"categories"} isActive={props.categories} icon={<CategoryIcon sx={{ fontSize: 20 }}/>}>Rubros</NavItem>
                                <NavItem onClick={closeSidebar} target={"diary"} isActive={props.diary} icon={<MenuBookIcon sx={{ fontSize: 20 }}/>}>Agenda</NavItem>
                                {isMasterAdmin && (<NavItem onClick={closeSidebar} target={"new-user"} isActive={props.newUser} icon={<GroupIcon sx={{ fontSize: 20 }}/>}>Usuarios</NavItem>)}
                                <NavItemWithSubitems
                                    onClick={closeSidebar}
                                    isActive={props.imports || props.consultaPagos || props.services}
                                    icon={<MoreHorizIcon/>}
                                    subitems={[
                                        {
                                            target: "imports",
                                            label: "Importar datos",
                                            icon: <ImportExportIcon fontSize="small" />,
                                            isActive: props.imports
                                        },
                                        {
                                            target: "consulta-pagos",
                                            label: "Consulta Pagos",
                                            icon: <PaymentIcon fontSize="small" />,
                                            isActive: props.consultaPagos
                                        },
                                        {
                                            target: "servicios",
                                            label: "Servicios",
                                            icon: <MiscellaneousServicesIcon fontSize="small" />,
                                            isActive: props.services
                                        }
                                    ]}
                                >
                                    Otros
                                </NavItemWithSubitems>
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

                <main style={{backgroundColor: COLORS.primary[50]}} className="relative md:ml-60 pt-12">
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
                    {props.professorPaymentCalculation && (<><ProfessorPaymentCalculation/></>)}
                    {props.professorDetail && (<><ProfessorDetail/></>)}
                    {props.courseDetail && (<><CourseDetail/></>)}
                    {props.studentDetail && (<><StudentDetail/></>)}
                    {props.professors && (<><Professors/></>)}
                    {props.consultaPagos && (<><ConsultaPagos/></>)}
                    {props.services && (<><Services/></>)}
                </main>
                </div>
            </div>
        </ThemeProvider>
    );
} 
