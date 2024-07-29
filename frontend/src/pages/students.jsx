import React, {useContext, useEffect, useState} from "react";
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
import PendingPaymentsModal from "../components/modal/pendingPaymentsModal";
import ButtonPrimary from "../components/button/primary";
import { useNavigate } from "react-router-dom";

export default function Students(props) {
    const { students, isLoadingStudents, deleteStudent, editStudent, newStudent, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const navigate = useNavigate(); 
    const [studentId, setStudentId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando alumnos...');
    const [edit, setEdit] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState({});
    const [isDocumentDuplicated, setIsDocumentDuplicated] = useState(false);
    const [isEmailDuplicated, setIsEmailDuplicated] = useState(false);
    const [isPhoneNumberDuplicated, setIsPhoneNumberDuplicated] = useState(false);
    const [isOpenPendingPaymentsModal, setIsOpenPendingPaymentsModal] = useState(false);
    

    const switchPendingPaymentsModal = () => setIsOpenPendingPaymentsModal(!isOpenPendingPaymentsModal);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setStudentId(id);
    }

    const openEditModal = async (student) => {
        setStudentToEdit(student);
        setEdit(true);
        setDisplayModal(true);
        setStudentId(student.id);
    }

    const handleDeleteStudent = async () => {
        setIsLoading(true);
        try{
            await deleteStudent(studentId);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'El estudiante no pudo ser eliminado... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
    }

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            cell: row => <div className="underline text-yellow-900 mx-1 cursor-pointer" onClick={() => navigate(`/home/students/${row.id}`)}>{row.name}</div>,
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
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: edit ? studentToEdit.name : '',
            surname: edit ? studentToEdit.lastName : '',
            document: edit ? studentToEdit.document : null,
            email: edit ? studentToEdit.email : '',
            phoneNumber: edit ? studentToEdit.phoneNumber : null
        },
        onSubmit: async (values,  { resetForm }) => {
          const body = {
            name: values.name,
            lastName: values.surname,
            document: (values.document !== '') ? values.document : null,
            email: values.email,
            phoneNumber: values.phoneNumber
          };
          setIsLoading(true);
          try {
            if(edit) {
                await editStudent(studentId, body);
                setEdit(false);
            }else {
                await newStudent(body);
            }
            resetForm();
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'El estudiante no pudo ser informado... Por favor inténtelo nuevamente.');
            resetForm();
            setIsLoading(false);
            setDisplayModal(false);
          }
        },
      });

    useEffect(() => {
        if(students.length === 0 && !isLoadingStudents)
            setOpResult('No fue posible obtener los alumnos, por favor recargue la página...');
    }, [students, isLoadingStudents]);

    

    const checkDuplicated = (field, callback) => {
        const isDuplicated = students.some(st => st[field] == formik.values[field]);
        if (isDuplicated) {
            callback();
        }
    }

    return(
        <>
            <Container title="Alumnos">
                <Table
                    columns={columns}
                    defaultSortFieldId={2}
                    data={students}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    responsive
                    noDataComponent={opResult}
                />
                <div className="flex justify-between mt-6">
                    <div>
                        <ButtonPrimary onClick={switchPendingPaymentsModal}>Ver alumnos deudores</ButtonPrimary>
                    </div>
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <PendingPaymentsModal isOpen={isOpenPendingPaymentsModal} onClose={switchPendingPaymentsModal}/>
                <Modal buttonDisabled={isDocumentDuplicated || isEmailDuplicated || isPhoneNumberDuplicated} icon={<SchoolIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar alumno' : 'Agregar alumno'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
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
                            <div className="mb-4">
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
                            <div className="mb-4">
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
                            </div>
                        </div>
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar alumno" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteStudent} children={<><div>Esta a punto de elimnar este alumno. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 