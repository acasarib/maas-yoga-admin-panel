import React, { useState, useContext } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { orange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from "../components/container";
import Table from "../components/table";
import { Context } from "../context/Context";

export default function Diary(props) {

    const { students  } = useContext(Context);
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

    const columns = [
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Documento',
            selector: row => row.document,
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
            selector: row => row.phoneNumber,
            sortable: true,
        },
    ];

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    return (<>
        <Container title="Agenda" className="max-w-full">
            <ThemeProvider theme={theme}>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabValue}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTabValue} textColor="primary" indicatorColor="primary">
                                <Tab label="Balance" value="1" />
                                <Tab label="Pagos" value="2" />
                                <Tab label="Alumnos" value="3" />
                            </TabList>
                        </Box>
                        <TabPanel className="pt-4" value="1">
                            <Table
                                columns={columns}
                                data={students}
                                pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                                responsive
                            />
                        </TabPanel>
                        <TabPanel className="pt-4" value="2">Blah 2</TabPanel>
                        <TabPanel className="pt-4" value="3">Blah 3</TabPanel>
                    </TabContext>
                </Box>
            </ThemeProvider>
        </Container>
    </>);
} 