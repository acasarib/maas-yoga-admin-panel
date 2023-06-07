import React, { useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DragNDrop from "../../dragndrop/dragndrop";
import Papa from "papaparse";
import Table from "../../table";
import ButtonPrimary from "../../button/primary";
import { orange } from '@mui/material/colors';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Spinner from "../../spinner/spinner";

export default function ImportModule({ onCancel, moduleName, csvToObject, isAlreadyImported, columns, onImport }) {
    const [isLoading, setIsLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(null);
    const [notImportedData, setNotImportedData] = useState(null);
    const [alreadyImportedData, setAlreadyImportedData] = useState(null);
    const [selectedData, setSelectedData] = useState([]);
    const [tabValue, setTabValue] = useState('1');

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

    const onDropAccepted = (csvFile) => {
        setIsLoading(true);
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = csvToObject(results.data);
                const notImported = [];
                const alreadyImported = [];
                data.forEach(d => {
                    if (isAlreadyImported(d))
                        alreadyImported.push(d);
                    else
                        notImported.push(d);
                });
                setNotImportedData(notImported);
                setAlreadyImportedData(alreadyImported);
                setIsLoading(false);
            },
        });
    }

    

    const handleOnImport = async () => {
        setImportProgress("0");
        const observable = onImport(selectedData);
        observable.subscribe({
            next(percentage) {
                setImportProgress(Math.floor(percentage*100)/100);
            },
            complete() {
                setImportProgress(null);
                setSelectedData([]);
                setAlreadyImportedData(current => [...current, ...selectedData]);
                setNotImportedData(current => current.filter(c => !selectedData.some(d => d.id === c.id)));
            }
        });
    }

    const onSelectedRowsChange = data => setSelectedData(data.selectedRows);

    const handleChangeTabValue = (event, newValue) => {
        setTabValue(newValue);
    };

    const NotImportedTable = (<>
        <Table
            columns={columns}
            data={notImportedData}
            pagination
            paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            selectableRows
            onSelectedRowsChange={onSelectedRowsChange}
            noDataComponent={`No hay ${moduleName}`}
        />
        <div className="flex w-full justify-end">
            <ButtonPrimary onClick={handleOnImport} disabled={selectedData.length === 0}>{importProgress === null ? `Importar seleccionados (${selectedData.length} ${moduleName})` : `Importando... (${importProgress}%)`}</ButtonPrimary>
        </div>
    </>);

    const AlreadyImportedTable = (<>
        <Table
            columns={columns}
            data={alreadyImportedData}
            pagination
            paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            noDataComponent={`No hay ${moduleName} importados aun`}
        />
    </>);

    return (<>
        <div className="flex items-center mb-6">
            <ArrowBackIcon onClick={onCancel} className="cursor-pointer"/>
            <h1 className="w-full text-2xl md:text-3xl text-center font-bold text-yellow-900">Importar {moduleName}</h1>
        </div>
        <div>
            {isLoading ? <div className="flex justify-center"><Spinner/></div> : <>
                {notImportedData === null ?
                    <DragNDrop multiple={false} onDropAccepted={onDropAccepted} acceptedFiles={{ 'text/csv': ['.csv'] }}/>
                    :
                <>
                    <ThemeProvider theme={theme}>
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <TabContext value={tabValue}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList onChange={handleChangeTabValue}>
                                            <Tab label="Sin importar" value="1" />
                                            <Tab label="Ya importados" value="2" />
                                    </TabList>
                                </Box>
                                <TabPanel value="1">{NotImportedTable}</TabPanel>
                                <TabPanel value="2">{AlreadyImportedTable}</TabPanel>
                            </TabContext>
                        </Box>
                    </ThemeProvider>
                </>}
            </>}
        </div>
    </>);
} 