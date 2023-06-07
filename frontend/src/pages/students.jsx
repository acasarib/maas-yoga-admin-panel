import React, {useContext, useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import Modal from "../components/modal";
import SchoolIcon from '@mui/icons-material/School';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import Table from "../components/table";
import { Context } from "../context/Context";
import Container from "../components/container";

export default function Students(props) {
    const { students, isLoadingStudents, deleteStudent, editStudent, newStudent, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando alumnos...');
    const [edit, setEdit] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState({});
    const [displayCoursesModal, setDisplayCoursesModal] = useState(false);
    const [coursesLists, setCoursesLists] = useState([]);
    const [studentName, setStudentName] = useState("");
    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
        setDisplayCoursesModal(value);
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

    
    const openCoursesModal = (courses, studentName, studentSurname) => {
        setDisplayCoursesModal(true);
        setCoursesLists(courses);
        const name = studentName + ' ' + studentSurname;
        setStudentName(name);
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
            name: 'Cursos',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openCoursesModal(row.courses, row.name, row.lastName)}>Ver cursos</button></div>)},
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const coursesColumns = [
        {
            name: 'Título',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.title}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.title}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
            searchable: true,
            selector: row => row.title,
        },
        {
            name: 'Descripción',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.description}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.description}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
        },
        {
            name: 'Fecha de inicio',
            selector: row => {var dt = new Date(row.startAt);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date},
            sortable: true,
        },
        {
            name: 'Duración',
            selector: row => row.duration,
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
        onSubmit: async (values) => {
          const body = {
            name: values.name,
            lastName: values.surname,
            document: values.document,
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
        if(students.length === 0 && !isLoadingStudents)
            setOpResult('No fue posible obtener los alumnos, por favor recargue la página...');
    }, [students, isLoadingStudents]);

    /*const white = orange[50];*/

    return(
        <>
            <Container title="Alumnos">
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    <Table
                        columns={columns}
                        data={students}
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        responsive
                        noDataComponent={opResult}
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setDisplayModal(true)}
                            className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
                <Modal icon={<SchoolIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar alumno' : 'Agregar alumno'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                    <form className="pr-8 pt-6 mb-4"    
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
                                    onBlur={formik.handleBlur}
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
                                    onBlur={formik.handleBlur}
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
                                    onBlur={formik.handleBlur}
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
                <Modal style={{ minWidth: '600px' }} hiddingButton icon={<LocalLibraryIcon />} open={displayCoursesModal} setDisplay={setDisplay} closeText="Salir" title={'Cursos del alumno ' + studentName} children={<><div><Table
                        columns={coursesColumns}
                        data={coursesLists}
                        noDataComponent="Este alumno no esta asociado a ningun curso"
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                /></div></>} />
            </Container>
        </>
    );
} 