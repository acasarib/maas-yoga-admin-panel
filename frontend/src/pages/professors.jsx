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
import CustomRadio from "../components/radio/customRadio";
import { useNavigate } from "react-router-dom";
import DeleteButton from "../components/button/deleteButton";
import EditButton from "../components/button/editButton";
import { COLORS } from "../constants";
import ButtonPrimary from "../components/button/primary";
import PendingProfessorPaymentsModal from "../components/modal/pendingProfessorPaymentsModal";
import useToggle from "../hooks/useToggle";

export default function Professors(props) {
    const { getProfessors, isLoadingProfessors, deleteProfessor, editProfessor, newProfessor, changeAlertStatusAndMessage } = useContext(Context);
    const paymentsModal = useToggle(false);
    const [displayModal, setDisplayModal] = useState(false);
    const [professors, setProfessors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [professorId, setProfessorId] = useState(null);
    const [professorToDelete, setProfessorToDelete] = useState(null);
    const [edit, setEdit] = useState(false);
    const [professorToEdit, setProfessorToEdit] = useState({});
    const [isPhoneNumberDuplicated, setIsPhoneNumberDuplicated] = useState(false);
    const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
    
    const navigate = useNavigate(); 

    const fetchProfessors = async (force = false) => {
        setIsLoading(true);
        const data = await getProfessors(force);
        setProfessors(data);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchProfessors(true);
    }, []);

    const [selectedProfessorInvoiceType, setSelectedProfessorInvoiceType] = useState('A');
    const handleOptionChange = (event) => {
        setSelectedProfessorInvoiceType(event.target.value);
    };

    const setDisplay = (value) => {
        setDisplayModal(value);
        setEdit(false);
    }

    const openDeleteModal = (id, professor) => {
        setDeleteModal(true);
        setProfessorId(id);
        setProfessorToDelete(professor);
    }

    const openEditModal = async (professor) => {
        setProfessorId(professor.id);
        setProfessorToEdit(professor);
        setEdit(true);
        setDisplayModal(true);
    }

    const handleDeleteProfessor = async () => {
        setIsLoading(true);
        try{
            await deleteProfessor(professorId);
            setTimeout(() => {
                fetchProfessors(true);
            }, 150);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El profesor no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
    }

    const handleOnClickProfessor = async (professor) => {
        navigate(`/home/professors/${professor.id}`)
    }

    const columns = useMemo(() => [
        {
            name: 'Nombre',
            selector: row => row.name,
            cell: row => <div style={{ color: COLORS.primary[900] }} className="underline mx-1 cursor-pointer" onClick={() => handleOnClickProfessor(row)}>{row.name}</div>,
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
            name: 'Acciones',
            cell: row => (<div className="flex-row"><DeleteButton onClick={() => openDeleteModal(row.id, row)}/><EditButton onClick={() => openEditModal(row)} /></div>),
            sortable: true,
        },
    ], [professors]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: edit ? professorToEdit.name : '',
            surname: edit ? professorToEdit.lastName : '',
            phoneNumber: edit ? professorToEdit.phoneNumber : '',
            email: edit ? professorToEdit.email : '',
        },
        onSubmit: async (values) => {
          const body = {
            name: values.name,
            lastName: values.surname,
            phoneNumber: values.phoneNumber,
            email: values.email,
            invoiceType: selectedProfessorInvoiceType,
          };
          setIsLoading(true);
          try {
            if(edit) {
                await editProfessor(professorId, body);
                setEdit(false);
                setProfessorId(null);
                setProfessorToEdit({});
                setTimeout(() => {
                    fetchProfessors(true);
                }, 150);
            }else {
                await newProfessor(body);
                setTimeout(() => {
                    fetchProfessors(true);
                }, 150);
                formik.resetForm();
            }
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'El estudiante no pudo ser informado... Por favor inténtelo nuevamente.')
            setIsLoading(false);
            setDisplayModal(false);
          }
          formik.values = {};
        },
    });

    const checkDuplicated = (field, callback) => {
        const isDuplicated = professors.some(st => st[field] == formik.values[field]);
        if (isDuplicated) {
            callback();
        }
    }

    return(
        <>
            <Container title="Profesores">
                <Table
                    progressPending={isLoading}
                    columns={columns}
                    data={professors}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    responsive
                    noDataComponent={<NoDataComponent Icon={SchoolIcon} title="No hay profesores" subtitle="No se encontraron profesores registrados"/>}
                />
                <div className="flex justify-between mt-6 items-center">
                    <div>
                        <ButtonPrimary onClick={paymentsModal.enable}>Ver pagos pendientes</ButtonPrimary>
                    </div>
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <PendingProfessorPaymentsModal 
                    isOpen={paymentsModal.value} 
                    onClose={paymentsModal.disable} 
                />
                <Modal icon={<SchoolIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar profesor' : 'Agregar profesor'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                    <form className="flex flex-col sm:grid sm:grid-cols-2 gap-6"
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
                            label="Numero de contacto"    
                            onBlur={() => checkDuplicated("phoneNumber", () => setIsPhoneNumberDuplicated(true))}
                            onFocus={() => setIsPhoneNumberDuplicated(false)}
                            isInvalid={isPhoneNumberDuplicated}
                            invalidMessage={"Numero ya registrado"}
                            value={formik.values.phoneNumber}
                            name="phoneNumber"
                            htmlFor="phoneNumber"
                            id="phoneNumber" 
                            type="text" 
                            placeholder="Numero de contacto" 
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
                        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <CustomRadio
                                checked={selectedProfessorInvoiceType === 'A'}
                                onChange={handleOptionChange}
                                value="A"
                                name="radio-buttons"
                                inputProps={{ 'aria-label': 'A' }}
                                label="FA (Factura A)"
                            />
                            <CustomRadio
                                type="radio"
                                value="B"
                                checked={selectedProfessorInvoiceType === 'B'}
                                onChange={handleOptionChange}
                                label="FB (Factura B)"
                            />
                            <CustomRadio
                                type="radio"
                                value="C"
                                checked={selectedProfessorInvoiceType === 'C'}
                                onChange={handleOptionChange}
                                label="FC (Factura C)"
                            />
                            <CustomRadio
                                type="radio"
                                value="NF"
                                checked={selectedProfessorInvoiceType === 'NF'}
                                onChange={handleOptionChange}
                                label="NF (No Factura)"
                            />
                        </div>
                    </form>
                </>
                } />
                <Modal 
                  danger 
                  icon={<DeleteIcon />} 
                  open={deleteModal} 
                  setDisplay={() => setDeleteModal(false)} 
                  title="Eliminar profesor" 
                  buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} 
                  onClick={handleDeleteProfessor} 
                >
                  <div>¿Está seguro que desea eliminar al profesor <strong>{professorToDelete?.name} {professorToDelete?.lastName}</strong>? Esta acción no se puede deshacer.</div>
                </Modal>
            </Container>
        </>
    );
} 