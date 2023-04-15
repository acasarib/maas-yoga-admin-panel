import React, { useState } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ClassesSection from "../components/section/classes/classesSection";
import VerifyPaymentClassesSection from "../components/section/classes/verifyPaymentClassesSection";

export default function Classes(props) {
    
    const [tabValue, setTabValue] = useState("1");

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                    <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Clases</h1>
                    <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChangeTabValue}>
                            <Tab label="Clases" value="1" />
                            <Tab label="Verificar pagos" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1"><ClassesSection/></TabPanel>
                    <TabPanel value="2"><VerifyPaymentClassesSection/></TabPanel>
                    </TabContext>
                </Box>
                </div>    
            </div>
        </>
    );
} 