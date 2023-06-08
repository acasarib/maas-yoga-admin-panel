import React, { useState } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ClassesSection from "../components/section/classes/classesSection";
import VerifyPaymentClassesSection from "../components/section/classes/verifyPaymentClassesSection";
import { orange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Container from "../components/container";

export default function Classes(props) {

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

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    return(
        <>
            <Container title="Clases">
                <ThemeProvider theme={theme}>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                        <TabContext value={tabValue}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={handleChangeTabValue}>
                                <Tab label="Clases" value="1" />
                                <Tab label="Verificar pagos" value="2" />
                            </TabList>
                        </Box>
                        <TabPanel className="pt-4" value="1"><ClassesSection/></TabPanel>
                        <TabPanel className="pt-4" value="2"><VerifyPaymentClassesSection/></TabPanel>
                        </TabContext>
                    </Box>
                </ThemeProvider>
            </Container>
        </>
    );
} 