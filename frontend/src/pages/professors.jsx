import React, {useContext, useEffect, useMemo, useState} from "react";
import Modal from "../components/modal";
import SchoolIcon from '@mui/icons-material/School';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Table from "../components/table";
import { Context } from "../context/Context";
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import CustomRadio from "../components/radio/customRadio";
import ProfessorDetailModal from "../components/modal/professorDetailModal";

export default function Professors(props) {
    const { professors, isLoadingProfessors, deleteProfessor, editProfessor, newProfessor, getProfessorDetailsById, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [professorId, setProfessorId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando profesores...');
    const [edit, setEdit] = useState(false);
    const [professorToEdit, setProfessorToEdit] = useState({});
    const [professorDetail, setProfessorDetail] = useState(null);
    const [professorModal, setProfessorModal] = useState(null);
    const [isPhoneNumberDuplicated, setIsPhoneNumberDuplicated] = useState(false);
    const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 700px)").matches
    )

    const [selectedProfessorInvoiceType, setSelectedProfessorInvoiceType] = useState('A');
    const handleOptionChange = (event) => {
        setSelectedProfessorInvoiceType(event.target.value);
    };

    const setDisplay = (value) => {
        setDisplayModal(value);
        setEdit(false);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setProfessorId(id);
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
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El profesor no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
    }

    const handleOnClickProfessor = async (professor) => {
        getProfessorDetailsById(professor.id);
        setProfessorDetail(professor);
    }

    const columns = useMemo(() => [
        {
            name: 'Nombre',
            selector: row => row.name,
            cell: row => <div className="underline text-yellow-900 mx-1" onClick={() => handleOnClickProfessor(row)}>{row.name}</div>,
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
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
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
            }else {
                await newProfessor(body);
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

    useEffect(() => {
        if(professors.length === 0 && !isLoadingProfessors)
            setOpResult('No fue posible obtener los profesores, por favor recargue la página...');
    }, [professors, isLoadingProfessors]);

    useEffect(() => {
        window
        .matchMedia("(min-width: 700px)")
        .addEventListener('change', e => setMatches( e.matches ));
    }, []);

    useEffect(() => {
        if (professorDetail !== null) {
            const prof = professors.find(p => p?.id === professorDetail?.id);
            setProfessorModal(JSON.parse(JSON.stringify(prof)));
        } else {
            setProfessorModal(null);
        }
    }, [professors, professorDetail]);

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
                    columns={columns}
                    data={professors}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    responsive
                    noDataComponent={opResult}
                />
                <div className="flex justify-end">
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <Modal icon={<SchoolIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar profesor' : 'Agregar profesor'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                    <form className="pt-6 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
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
                            </div>
                            <div className="mb-4">
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
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
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
                            </div>
                            <div className="mb-4">
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
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
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
                            </div>
                            <div className="mb-4">
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
                        </div>
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar profesor" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteProfessor} children={<><div>Esta a punto de elimnar este profesor. ¿Desea continuar?</div></>} />
                <ProfessorDetailModal isOpen={professorDetail !== null} onClose={() => setProfessorDetail(null)} professor={professorModal} />
            </Container>
        </>
    );
} 