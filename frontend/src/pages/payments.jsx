import React from "react";
import PaymentsSection from "../components/section/payments/paymentsSection";
import LogsPaymentSection from "../components/section/payments/logsPaymentSection";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import UnverifiedPaymentsSections from "../components/section/payments/unverifiedPaymentsSection";
import Container from "../components/container";
import useQueryParam from "../hooks/useQueryParam";

export default function Payments(props) {
    const [tabValue, setTabValue] = useQueryParam("tab", "1");
    const [defaultIdPayment] = useQueryParam("id", undefined);

    

    const handleChangeTabValue = (_, newValue) => setTabValue(newValue);

    return (<>
        <Container title="Movimientos" className="max-w-full">
            <Box sx={{ width: '100%', typography: 'body1' }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChangeTabValue} textColor="primary" indicatorColor="primary">
                            <Tab label="Pagos" value="1" />
                            <Tab label="Sin verificar" value="2" />
                            <Tab label="Registros" value="3" />
                        </TabList>
                    </Box>
                    <TabPanel className="pt-4" value="1">
                        <PaymentsSection
                            defaultTypeValue={defaultIdPayment !== undefined ? "id" : undefined}
                            defaultSearchValue={defaultIdPayment}
                        />
                    </TabPanel>
                    <TabPanel className="pt-4" value="2">
                        <UnverifiedPaymentsSections
                            defaultTypeValue={defaultIdPayment !== undefined ? "id" : undefined}
                            defaultSearchValue={defaultIdPayment}
                        />
                    </TabPanel>
                    <TabPanel className="pt-4" value="3"><LogsPaymentSection/></TabPanel>
                </TabContext>
            </Box>
        </Container>
    </>);
} 