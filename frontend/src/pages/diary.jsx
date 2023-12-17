import React, { useState, useMemo, useEffect } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { orange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from "../components/container";
import Table from "../components/table";
import diaryService from "../services/diaryService";
import AgendaPayments from "../components/section/agenda/agendaPayments";
import AgendaBalance from "../components/section/agenda/agendaBalance";
import CustomCheckbox from "../components/checkbox/customCheckbox";

export default function Diary(props) {
    const [users, setUsers] = useState([]);
    const [limit, setLimit] = useState(25);
    const [offset, setOffset] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [showActive, setShowActive] = useState(false);
    const [showDisabled, setShowDisabled] = useState(false);
    const [filteredStudents, setFilteredStudents] = useState([]);

    const theme = createTheme({
        palette: {
          primary: {
            // Purple and green play nicely together.
            main: orange[500],
          },
          secondary: {
            // This is green.A700 as hex.
            main: '#11cb5f',
          },
        },
    });

    const [tabValue, setTabValue] = useState("1");

    const columns = useMemo(() => {
        const newColumns = [
            {
                name: 'Nombre',
                selector: row => row.nombre,
                sortable: true,
                searchable: true,
            },
            {
                name: 'Apellido',
                selector: row => row.apellido,
                sortable: true,
                searchable: true,
            },
            {
                name: 'Alias',
                selector: row => row.alias,
                sortable: true,
            },
            {
                name: 'Email',
                cell: row => {return (<><div className="flex flex-col justify-center">
                <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="group cursor-pointer relative inline-block">{row.email}
                    <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                    {row.email}
                    <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                    </div>
                </div>
                </div>
            </div></>)},
                sortable: true,
                searchable: true,
                selector: row => row.email,
            },
            {
                name: 'Numero de telefono',
                selector: row => row.celular,
                sortable: true,
            },
            {
                name: 'Créditos',
                selector: row => row.creditos,
                sortable: true,
            },
        ];
        return newColumns;
    }, [users]); 

    const getMoreUsers = async (page, totalRows) => {
        console.log(page, usersPage);
        const newOffset = (totalRows / 2) + 25;
        const activeUsers = await diaryService.getUsers(25, newOffset, '2');
        const disableUsers = await diaryService.getUsers(25, newOffset, '3');
        const newUsers = activeUsers.concat(disableUsers);
        setUsers(users.concat(newUsers));
        setUsersPage(page);
        if(showDisabled){
            const disabledUsrs = users.filter(user => user.id_estado === '3');
            setFilteredStudents(disabledUsrs);
        }
        if(showActive){
                const activeUsrs = users.filter(user => user.id_estado === '2');
                setFilteredStudents(activeUsrs);
        }
    }

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    useEffect(() => {
        const getUsers = async () => {
            const activeUsers = await diaryService.getUsers(limit, offset, 2);
            const disableUsers = await diaryService.getUsers(limit, offset, 3);
            const totalUsers = activeUsers.concat(disableUsers);
            setUsers(totalUsers);
            setFilteredStudents(totalUsers);
        }
        getUsers();
    }, [])

    useEffect(() => {
      setFilteredStudents(users);
    }, [users])
    
    
    useEffect(() => {
        if(showDisabled){
            const disabledUsers = users.filter(user => user.id_estado === '3');
            setFilteredStudents(disabledUsers);
        }else{
            setFilteredStudents(users);
        }
    }, [showDisabled])

    useEffect(() => {
        if(showActive){
            const activeUsers = users.filter(user => user.id_estado === '2');
            setFilteredStudents(activeUsers);
        }else{
            setFilteredStudents(users);
        }
    }, [showActive])

    return (<>
        <Container title="Agenda" className="max-w-full">
            <ThemeProvider theme={theme}>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabValue}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTabValue} textColor="primary" indicatorColor="primary">
                                <Tab label="Alumnos" value="1" />
                                <Tab label="Pagos" value="2" />
                                <Tab label="Balance" value="3" />
                            </TabList>
                        </Box>
                        <TabPanel className="pt-4" value="1">
                            <Table
                                columns={columns}
                                data={filteredStudents}
                                onChangePage={(page, totalRows) => getMoreUsers(page, totalRows)}
                                pagination paginationRowsPerPageOptions={[24]}
                                responsive
                                paginationPerPage={24}
                            />
                            <div className="flex flex-row my-4">
                                <CustomCheckbox
                                    checked={showActive}
                                    labelOn="Mostrar activos"
                                    labelOff="Mostrar activos"
                                    className="ml-2"
                                    disabled={showDisabled}
                                    onChange={() => setShowActive(!showActive)}
                                />
                                <CustomCheckbox
                                    checked={showDisabled}
                                    labelOn="Mostrar no activos"
                                    labelOff="Mostrar no activos"
                                    className="ml-2"
                                    disabled={showActive}
                                    onChange={() => setShowDisabled(!showDisabled)}
                                />          
                            </div>
                        </TabPanel>
                        <TabPanel className="pt-4" value="2"><AgendaPayments/></TabPanel>
                        <TabPanel className="pt-4" value="3"><AgendaBalance/></TabPanel>
                    </TabContext>
                </Box>
            </ThemeProvider>
        </Container>
    </>);
} 