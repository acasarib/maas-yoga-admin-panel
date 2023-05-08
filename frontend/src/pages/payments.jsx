import React, { useState } from "react";
import PaymentsSection from "../components/section/payments/paymentsSection";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import UnverifiedPaymentsSections from "../components/section/payments/unverifiedPaymentsSection";

export default function Payments(props) {

    const [tabValue, setTabValue] = useState("1");

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    return (<>
        <div className="px-6 py-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-12 text-yellow-900">Movimientos</h1>
                <Box sx={{ width: '100%', typography: 'body1' }}>
                    <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChangeTabValue}>
                            <Tab label="Pagos" value="1" />
                            <Tab label="Sin verificar" value="2" />
                        </TabList>
                    </Box>
                    <TabPanel value="1"><PaymentsSection/></TabPanel>
                    <TabPanel value="2"><UnverifiedPaymentsSections/></TabPanel>
                    </TabContext>
                </Box>
            </div>
        </div>
    </>);
} 