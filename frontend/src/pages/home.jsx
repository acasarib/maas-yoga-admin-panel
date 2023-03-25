import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaidIcon from '@mui/icons-material/Paid';
import BalanceIcon from '@mui/icons-material/Balance';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SchoolIcon from '@mui/icons-material/School';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import Payments from "./payments";
import Balance from "./balance";
import Tasks from "./tasks";
import NewUser from "./newUser";
import Calendar from "./calendar";
import Colleges from "./colleges";
import Students from "./students";
import Courses from "./courses";
import studentsService from "../services/studentsService";
import coursesService from "../services/coursesService";
import tasksService from "../services/tasksService";
import collegesService from "../services/collegesService";

export default function Home(props) {
    const [date, setDate] = useState('');
    const [day, setDay] = useState('');
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [tasks, setTasks] = useState([]);
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

    useEffect(() => {
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name;
                student.value = student.id;
            })
            setStudents(studentsList);
        }
        const getCourses = async () => {
            const coursesList = await coursesService.getCourses();
            coursesList.forEach(course => {
                course.label = course.title;
                course.value = course.id;
            })
            setCourses(coursesList);
        }
        const getTasks = async () => {
            const tasksList = await tasksService.getTasks();
            setTasks(tasksList);
        }
        const getColleges = async () => {
            const collegesList = await collegesService.getColleges();
            setColleges(collegesList);
        }
        getStudents();
        getCourses();
        getTasks();
        getColleges();
      }, [])

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
                            <li className="grid place-content-stretch">
                                <Link to="/home/payments">
                                    <span className={props.payments ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <PaidIcon /><span className="ml-3">Pagos</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/tasks">
                                    <span className={props.tasks ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <AssignmentIcon /><span className="ml-3">Tareas pendientes</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/balance">
                                    <span className={props.balance ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <BalanceIcon /><span className="ml-3">Balance</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/calendar">
                                    <span className={props.calendar ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <CalendarMonthIcon /><span className="ml-3">Calendario</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/students">
                                    <span className={props.students ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <SchoolIcon /><span className="ml-3">Alumnos</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/colleges"> 
                                    <span className={props.colleges ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <AccountBalanceIcon /><span className="ml-3">Sedes</span>
                                    </span>
                                </Link>
                            </li>
                            <li className="grid place-content-stretch">
                                <Link to="/home/courses">
                                    <span className={props.courses ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <LocalLibraryIcon /><span className="ml-3">Cursos</span>
                                    </span>
                                </Link>
                            </li>
                            {isMasterAdmin && (<><li className="grid place-content-stretch">
                                <Link to="/home/new-user">
                                    <span className={props.newUser ? "w-full flex items-center bg-amber-600 rounded-xl font-bold text-sm text-white py-3 px-4" : "w-11/12 flex items-center bg-orange-50 rounded-xl font-bold text-sm text-yellow-900 py-3 px-4 hover:bg-orange-100 shadow-lg"}>
                                        <PersonAddIcon /><span className="ml-3">Agregar usuario</span>
                                    </span>
                                </Link>
                            </li></>)}
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

                <main className="ml-60 pt-16 max-h-screen overflow-auto">
                 
                            {props.payments && (<><Payments colleges={colleges} students={students} courses={courses}/></>)}
                            {props.newUser && (<><NewUser /></>)}
                            {props.tasks && (<><Tasks tasks={tasks}/></>)}
                            {props.calendar && (<><Calendar /></>)}
                            {props.balance && (<><Balance /></>)}
                            {props.colleges && (<><Colleges colleges={colleges} courses={courses} /></>)}
                            {props.courses && (<><Courses students={students} courses={courses} /></>)}
                            {props.students && (<><Students students={students} /></>)}
                 
                </main>
                </body>
            </div>
        </>
    );
} 