import React, { useState, useContext } from "react";
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
import { Context } from "../../../context/Context";
import Spinner from "../../spinner/spinner";

export default function ImportStudents({ onCancel }) {
    const { students, newStudents } = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [importProgress, setImportProgress] = useState(null);
    const [notImportedStudents, setNotImportedStudents] = useState(null);
    const [alreadyImportedStudents, setAlreadyImportedStudents] = useState(null);
    const [selectedStudents, setSelectedStudents] = useState([]);
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
                const onlyStudentsPermission = student => student["id_permiso"] === "3";
                const mapNull = str => str === "NULL" ? null : str;
                const mapDocument = str => {
                    if (str === "NULL")
                        return "0";
                    str = str.replaceAll(".", "").replaceAll("+", "").replaceAll("E", "").trim();
                    if (str === "")
                        return "0";
                    if (isNaN(str))
                        return "0";
                    return str;
                }
                const mapDate = date => {
                    try {
                        return new Date(date);
                    } catch {
                        return null;
                    }
                }
                const mapFieldsToObject = student => ({
                    id: mapNull(student.id),
                    name: mapNull(student.nombre),
                    lastName: mapNull(student.apellido),
                    document: mapDocument(student.documento),
                    email: mapNull(student.email),
                    phoneNumber: mapNull(student.telefono),
                    cellPhoneNumber: mapNull(student.celular),
                    contact: mapNull(student.celular),
                    image:  mapNull(student.imagen),
                    alias: mapNull(student.alias),
                    address: mapNull(student.direccion),
                    occupation: mapNull(student.ocupacion),
                    coverage: mapNull(student.cobertura),
                    isSelected: true,
                    createdAt: mapDate(student.create_at)
                });
                const data = results.data
                    .filter(onlyStudentsPermission)
                    .map(mapFieldsToObject);
                const notImported = [];
                const alreadyImported = [];
                data.forEach(d => {
                    const isAlreadyImported = students.some(st => st.email === d.email);
                    if (isAlreadyImported)
                        alreadyImported.push(d);
                    else
                        notImported.push(d);
                });
                setNotImportedStudents(notImported);
                setAlreadyImportedStudents(alreadyImported);
                setIsLoading(false);
            },
        });
    }

    const getImageUrl = image => `https://apireservas.maasyoga.com.ar/uploads/${image}`

    const columns = [
        {
            name: 'Id',
            selector: row => row.id,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Imagen',
            cell: row => <div>{row.image !== null ? <img alt="imagen" height={34} src={getImageUrl(row.image)}/> : ""}</div>,
        },
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
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
            searchable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Telefono',
            selector: row => row.phoneNumber,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Celular',
            selector: row => row.cellPhoneNumber,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Contacto',
            selector: row => row.contact,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Alias',
            selector: row => row.alias,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Direccion',
            selector: row => row.address,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Ocupacion',
            selector: row => row.occupation,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Cobertura',
            selector: row => row.coverage,
            sortable: true,
            searchable: true,
        },
    ];

    const onImport = async () => {
        setImportProgress("0");
        const observable = newStudents(selectedStudents);
        observable.subscribe({
            next(percentaje) {
                setImportProgress(Math.floor(percentaje*100)/100);
            },
            complete(_) {
                setImportProgress(null);
                setSelectedStudents([]);
                setAlreadyImportedStudents(current => [...current, ...selectedStudents]);
                setNotImportedStudents(current => current.filter(c => !selectedStudents.some(d => d.id === c.id)));
            }
        });
    }

    const onSelectedRowsChange = data => {
        setSelectedStudents(data.selectedRows);
    }

    const handleChangeTabValue = (event, newValue) => {
        setTabValue(newValue);
    };

    const NotImportedStudents = (<>
        <Table
            columns={columns}
            data={notImportedStudents}
            pagination
            paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            selectableRows
            onSelectedRowsChange={onSelectedRowsChange}
            noDataComponent={"No hay alumnos"}
        />
        <div className="flex w-full justify-end">
            <ButtonPrimary onClick={onImport} disabled={selectedStudents.length === 0}>{importProgress === null ? `Importar seleccionados (${selectedStudents.length} alumnos)` : `Importando... (${importProgress}%)`}</ButtonPrimary>
        </div>
    </>);

    const AlreadyImportedStudents = (<>
        <Table
            columns={columns}
            data={alreadyImportedStudents}
            pagination
            paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            noDataComponent={"Ningun alumno importado aun"}
        />
    </>);

    return (<>
        <div className="flex items-center mb-6">
            <ArrowBackIcon onClick={onCancel} className="cursor-pointer"/>
            <h1 className="w-full text-2xl md:text-3xl text-center font-bold text-yellow-900">Importar Alumnos</h1>
        </div>
        <div>
            {isLoading ? <div className="flex justify-center"><Spinner/></div> : <>
                {notImportedStudents === null ?
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
                                <TabPanel value="1">{NotImportedStudents}</TabPanel>
                                <TabPanel value="2">{AlreadyImportedStudents}</TabPanel>
                            </TabContext>
                        </Box>
                    </ThemeProvider>
                </>}
            </>}
        </div>
    </>);
} 