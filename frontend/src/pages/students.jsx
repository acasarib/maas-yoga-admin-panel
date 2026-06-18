import React, {useContext, useEffect, useMemo, useState} from "react";
import Modal from "../components/modal";
import SchoolIcon from '@mui/icons-material/School';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import Table from "../components/table";
import { Context } from "../context/Context";
import Container from "../components/container";
import NoDataComponent from "../components/table/noDataComponent";
import PlusButton from "../components/button/plus";
import PendingPaymentsModal from "../components/modal/pendingPaymentsModal";
import ButtonPrimary from "../components/button/primary";
import { useNavigate } from "react-router-dom";
import studentsService from "../services/studentsService";
import useToggle from "../hooks/useToggle";
import Loader from "../components/spinner/loader";
import DeleteButton from "../components/button/deleteButton";
import EditButton from "../components/button/editButton";
import { COLORS } from "../constants";
import Select from 'react-select';
import Label from '../components/label/label';

const COUNTRIES = [
    { label: '🇦🇷 Argentina', value: 'Argentina' },
    { label: '🇧🇴 Bolivia', value: 'Bolivia' },
    { label: '🇧🇷 Brasil', value: 'Brasil' },
    { label: '🇨🇱 Chile', value: 'Chile' },
    { label: '🇨🇴 Colombia', value: 'Colombia' },
    { label: '🇨🇷 Costa Rica', value: 'Costa Rica' },
    { label: '🇨🇺 Cuba', value: 'Cuba' },
    { label: '🇪🇨 Ecuador', value: 'Ecuador' },
    { label: '🇸🇻 El Salvador', value: 'El Salvador' },
    { label: '🇬🇹 Guatemala', value: 'Guatemala' },
    { label: '🇭🇳 Honduras', value: 'Honduras' },
    { label: '🇲🇽 México', value: 'México' },
    { label: '🇳🇮 Nicaragua', value: 'Nicaragua' },
    { label: '🇵🇦 Panamá', value: 'Panamá' },
    { label: '🇵🇾 Paraguay', value: 'Paraguay' },
    { label: '🇵🇪 Perú', value: 'Perú' },
    { label: '🇩🇴 República Dominicana', value: 'República Dominicana' },
    { label: '🇺🇾 Uruguay', value: 'Uruguay' },
    { label: '🇻🇪 Venezuela', value: 'Venezuela' },
    { label: '🇺🇸 Estados Unidos', value: 'Estados Unidos' },
    { label: '🇪🇸 España', value: 'España' },
    { label: '🇮🇹 Italia', value: 'Italia' },
    { label: '🇫🇷 Francia', value: 'Francia' },
    { label: '🇩🇪 Alemania', value: 'Alemania' },
    { label: '🇬🇧 Reino Unido', value: 'Reino Unido' },
    { label: '🇵🇹 Portugal', value: 'Portugal' },
    { label: '🇯🇵 Japón', value: 'Japón' },
    { label: '🇨🇳 China', value: 'China' },
    { label: '🇮🇳 India', value: 'India' },
    { label: '🇦🇺 Australia', value: 'Australia' },
    { label: '🇨🇦 Canadá', value: 'Canadá' },
    { label: '🌍 Otro', value: '__OTRO__' },
];

export default function Students(props) {
    const { deleteStudent, editStudent, newStudent, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const isLoading = useToggle();
    const [deleteModal, setDeleteModal] = useState(false);
    const navigate = useNavigate(); 
    const [studentId, setStudentId] = useState(null);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [edit, setEdit] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState({});
    const [isDocumentDuplicated, setIsDocumentDuplicated] = useState(false);
    const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
    const [isPhoneNumberDuplicated, setIsPhoneNumberDuplicated] = useState(false);
    const [isCustomCountry, setIsCustomCountry] = useState(false);
    const [isOpenPendingPaymentsModal, setIsOpenPendingPaymentsModal] = useState(false);
    const [pageableStudents, setPageableStudents] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [searchParams, setSearchParams] = useState(null)
    const [resetTable, setResetTable] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);


    const switchPendingPaymentsModal = () => setIsOpenPendingPaymentsModal(!isOpenPendingPaymentsModal);

    useEffect(() => {
        fetchStudents(currentPage, perPage, searchParams)
    }, [currentPage, perPage, searchParams]);

    const fetchStudents = async () => {
        isLoading.enable()   
        const data = await studentsService.getStudents(currentPage, perPage, searchParams);        
        isLoading.disable()
        setPageableStudents(data.data);
        setTotalRows(data.totalItems);        
    }
    
    const handlePerRowsChange = async (newPerPage, page) => {
        setPerPage(newPerPage);
    };

    const handlePageChange = page => {  
        setCurrentPage(page);
    };

    useEffect(() => {
        if (resetTable)
            setResetTable(false)
    }, [resetTable])

    const handleOnSearch = async (searchParams) => {
        clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(async () => {
            let searchBy = searchParams.byAllFields ? 'all' : searchParams.serverProp;
            let searchValue = searchParams.searchValue;
            let searchOperation = searchParams.serverOperation;
            
            if (searchValue === "") {//Sin filtro
                setSearchParams(null)
            } else if (!searchParams.byAllFields) {// Un filtro solo
                const params = {
                    [searchBy]: {
                        value: searchValue,
                        operation: searchOperation,
                    }
                }
                setSearchParams(params)
            } else { // Filtro Todos
                const params = {}
                const searchBy = ["name", "lastName", "email"];
                
                searchParams.columns.forEach(column => {
                    if (!("serverProp" in column)) return
                    if (searchBy.includes(column.serverProp)) {
                        params[column.serverProp] = {
                            value: searchValue,
                            operation: 'iLike',
                        }
                    }
                })
                params.isOrOperation = true
                setSearchParams(params)
            }
        }, 500)); // Espera 500ms después de que el usuario deje de escribir
    }

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const openDeleteModal = (student) => {
        setDeleteModal(true);
        setStudentId(student.id);
        setStudentToDelete(student);
    }

    const openEditModal = async (student) => {
        setStudentToEdit(student);
        setEdit(true);
        setDisplayModal(true);
        setStudentId(student.id);
        const isKnown = !student.country || COUNTRIES.some(c => c.value === student.country);
        setIsCustomCountry(!isKnown);
    }

    const handleDeleteStudent = async () => {
        isLoading.enable()
        try{
            await deleteStudent(studentId);
            setTimeout(() => {
                fetchStudents();
            }, 150);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El estudiante no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        isLoading.disable()
        setDeleteModal(false);
    }

    const columns = useMemo(() => [
        {
            serverProp: 'name',
            serverOperation: 'iLike',
            name: 'Nombre',
            selector: row => row.name,
            cell: row => <div style={{ color: COLORS.primary[900] }} className="underline mx-1 cursor-pointer" onClick={() => navigate(`/home/students/${row.id}`)}>{row.name}</div>,
            sortable: true,
            searchable: true,
        },
        {
            serverProp: 'lastName',
            serverOperation: 'iLike',
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
            serverProp: 'email',
            serverOperation: 'iLike',
            name: 'Email',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.email}
                <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.email}
                  <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
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
        {
            name: 'Acciones',
            cell: row => (<div className="flex-row"><DeleteButton onClick={() => openDeleteModal(row)}/><EditButton onClick={() => openEditModal(row)} /></div>),
            sortable: true,
        },
    ], []);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: edit ? studentToEdit.name : '',
            surname: edit ? studentToEdit.lastName : '',
            document: edit ? studentToEdit.document : null,
            email: edit ? studentToEdit.email : '',
            phoneNumber: edit ? studentToEdit.phoneNumber : null,
            country: edit ? (studentToEdit.country || 'Argentina') : 'Argentina',
            customCountry: '',
            province: edit ? (studentToEdit.province || 'Buenos Aires') : 'Buenos Aires',
            neighborhood: edit ? studentToEdit.neighborhood : '',
            ivaCondition: edit ? (studentToEdit.ivaCondition || '') : '',
            cuit: edit ? (studentToEdit.cuit || '') : ''
        },
        onSubmit: async (values,  { resetForm }) => {
          const body = {
            name: values.name,
            lastName: values.surname,
            document: (values.document !== '') ? values.document : null,
            email: values.email,
            phoneNumber: values.phoneNumber,
            country: (isCustomCountry ? values.customCountry : values.country) || null,
            province: values.province || null,
            neighborhood: values.neighborhood || null,
            ivaCondition: values.ivaCondition || null,
            cuit: values.cuit || null
          };
          isLoading.enable()
          try {
            if(edit) {
                await editStudent(studentId, body);
                setEdit(false);
                setTimeout(() => {
                    fetchStudents();
                }, 150);
            }else {
                await newStudent(body);
                setTimeout(() => {
                    fetchStudents();
                }, 150);
            }
            resetForm();
            isLoading.disable();
            setIsCustomCountry(false);
            setDisplayModal(false);
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'El estudiante no pudo ser informado... Por favor inténtelo nuevamente.');
            resetForm();
            isLoading.disable();
            setIsCustomCountry(false);
            setDisplayModal(false);
          }
        },
    });

    const checkDuplicated = async (field, callback) => {
        const isDuplicated = await studentsService.exists(field, formik.values[field])
        if (isDuplicated) {
            callback();
        }
    }

    return(
        <>
            <Container title="Alumnos">
                <Table
                    resetTable={resetTable}
                    handleCustomSearchValue={handleOnSearch}
                    columns={columns}
                    serverPaginationData={pageableStudents}
                    paginationServer
                    noDataComponent={<NoDataComponent Icon={SchoolIcon} title="No hay alumnos" subtitle="No se encontraron alumnos registrados"/>}
                    progressPending={isLoading.value}
                    paginationTotalRows={totalRows}
                    onChangePage={handlePageChange}
                    onChangeRowsPerPage={handlePerRowsChange}
                    paginationDefaultPage={currentPage}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
                <div className="flex justify-between mt-6 items-center">
                    <div>
                        <ButtonPrimary onClick={switchPendingPaymentsModal}>Ver alumnos deudores</ButtonPrimary>
                    </div>
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <PendingPaymentsModal isOpen={isOpenPendingPaymentsModal} onClose={switchPendingPaymentsModal}/>
                <Modal buttonDisabled={isDocumentDuplicated || isEmailDuplicated || isPhoneNumberDuplicated} icon={<SchoolIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar alumno' : 'Agregar alumno'} buttonText={isLoading.value ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                    <form
                        className="flex flex-col sm:grid sm:grid-cols-2 gap-6"
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <CommonInput 
                            label="Nombre"    
                            onBlur={formik.handleBlur}
                            value={formik.values.name}
                            name="name"
                            htmlFor="name"
                            id="name" 
                            type="text" 
                            placeholder="Nombre" 
                            onChange={formik.handleChange}
                        />
                    
                        <CommonInput 
                            label="Apellido"    
                            onBlur={formik.handleBlur}
                            value={formik.values.surname}
                            name="surname"
                            htmlFor="surname"
                            id="surname" 
                            type="text" 
                            placeholder="Apellido"
                            onChange={formik.handleChange}
                        />
                        <CommonInput 
                            label="Documento"    
                            onBlur={() => checkDuplicated("document", () => setIsDocumentDuplicated(true))}
                            onFocus={() => setIsDocumentDuplicated(false)}
                            isInvalid={isDocumentDuplicated}
                            invalidMessage={"Documento ya registrado"}
                            value={formik.values.document}
                            name="document"
                            htmlFor="document"
                            id="document" 
                            type="number" 
                            placeholder="Documento"
                            onChange={formik.handleChange}
                        />
                        <CommonInput 
                            label="Email"    
                            onBlur={() => checkDuplicated("email", () => setIsEmailDuplicated(true))}
                            onFocus={() => setIsEmailDuplicated(false)}
                            isInvalid={isEmailDuplicated}
                            invalidMessage={"Email ya registrado"}
                            value={formik.values.email}
                            name="email"
                            htmlFor="email"
                            id="email" 
                            type="text" 
                            placeholder="Email" 
                            onChange={formik.handleChange}
                        />
                        <CommonInput 
                            label="Numero de telefono"    
                            onBlur={() => checkDuplicated("phoneNumber", () => setIsPhoneNumberDuplicated(true))}
                            onFocus={() => setIsPhoneNumberDuplicated(false)}
                            isInvalid={isPhoneNumberDuplicated}
                            invalidMessage={"Numero ya registrado"}
                            value={formik.values.phoneNumber}
                            name="phoneNumber"
                            htmlFor="phoneNumber"
                            id="phoneNumber" 
                            type="number" 
                            placeholder="Numero de telefono"
                            onChange={formik.handleChange}
                        />
                        <div>
                            <Label htmlFor="country">País</Label>
                            {isCustomCountry ? (
                                <div className="flex gap-2 items-center">
                                    <input
                                        id="customCountry"
                                        name="customCountry"
                                        type="text"
                                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400"
                                        placeholder="Escribir país"
                                        value={formik.values.customCountry || (edit && !COUNTRIES.some(c => c.value === formik.values.country) ? formik.values.country : '')}
                                        onChange={(e) => formik.setFieldValue('customCountry', e.target.value)}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="text-xs text-blue-500 underline whitespace-nowrap"
                                        onClick={() => { setIsCustomCountry(false); formik.setFieldValue('country', 'Argentina'); formik.setFieldValue('customCountry', ''); }}
                                    >Volver al listado</button>
                                </div>
                            ) : (
                                <Select
                                    inputId="country"
                                    name="country"
                                    options={COUNTRIES}
                                    value={COUNTRIES.find(c => c.value === formik.values.country) || null}
                                    onChange={(option) => {
                                        if (option && option.value === '__OTRO__') {
                                            setIsCustomCountry(true);
                                            formik.setFieldValue('country', '__OTRO__');
                                            formik.setFieldValue('customCountry', '');
                                        } else {
                                            formik.setFieldValue('country', option ? option.value : '');
                                        }
                                    }}
                                    placeholder="Seleccionar país"
                                    noOptionsMessage={() => 'No encontrado'}
                                    styles={{ menu: provided => ({ ...provided, zIndex: 9999 }) }}
                                />
                            )}
                        </div>
                        <CommonInput
                            label="Provincia"
                            onBlur={formik.handleBlur}
                            value={formik.values.province}
                            name="province"
                            htmlFor="province"
                            id="province"
                            type="text"
                            placeholder="Provincia"
                            onChange={formik.handleChange}
                        />
                        <CommonInput
                            label="Barrio"
                            onBlur={formik.handleBlur}
                            value={formik.values.neighborhood}
                            name="neighborhood"
                            htmlFor="neighborhood"
                            id="neighborhood"
                            type="text"
                            placeholder="Barrio"
                            onChange={formik.handleChange}
                        />
                        <div>
                            <Label htmlFor="ivaCondition">Condición IVA</Label>
                            <select
                                id="ivaCondition"
                                name="ivaCondition"
                                value={formik.values.ivaCondition}
                                onChange={formik.handleChange}
                                className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-orange-400 bg-white"
                            >
                                <option value="">Sin especificar</option>
                                <option value="CONSUMIDOR_FINAL">Consumidor Final (Factura B)</option>
                                <option value="RESPONSABLE_INSCRIPTO">Responsable Inscripto (Factura A)</option>
                                <option value="MONOTRIBUTO">Monotributo (Factura B)</option>
                                <option value="EXENTO">IVA Exento (Factura B)</option>
                            </select>
                        </div>
                        <CommonInput
                            label="CUIL / CUIT"
                            onBlur={formik.handleBlur}
                            value={formik.values.cuit}
                            name="cuit"
                            htmlFor="cuit"
                            id="cuit"
                            type="text"
                            placeholder="XX-XXXXXXXX-X"
                            onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').substring(0, 11);
                                let formatted = digits;
                                if (digits.length > 2) formatted = `${digits.slice(0,2)}-${digits.slice(2)}`;
                                if (digits.length > 10) formatted = `${digits.slice(0,2)}-${digits.slice(2,10)}-${digits.slice(10)}`;
                                formik.setFieldValue('cuit', formatted);
                            }}
                        />
                    </form>
                </>
                } />
                <Modal danger icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar alumno" buttonText={isLoading.value ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteStudent} children={<><div>Esta a punto de eliminar al alumno <strong>{studentToDelete?.name || 'este alumno'}</strong>. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 