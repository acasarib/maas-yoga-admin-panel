import React, {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import Modal from "../components/modal";
import SchoolIcon from '@mui/icons-material/School';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import studentsService from "../services/studentsService";
import DataTable from 'react-data-table-component';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Select from 'react-select';
import coursesService from '../services/coursesService';

export default function Students(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [studentId, setStudentId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando alumnos...');
    const [edit, setEdit] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState({});
    const [courses, setCourses] = useState([]);
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
        await setStudentToEdit(student);
        setEdit(true);
        setDisplayModal(true);
        setStudentId(student.id);
    }

    const deleteStudent = async () => {
        setIsLoading(true);
        await studentsService.deleteStudent(studentId);
        setIsLoading(false);
        setDeleteModal(false);
        const response = await studentsService.getStudents();
        setStudents(response);
    }

    const [selectedOption, setSelectedOption] = useState("");

    var handleChange = (selectedOption) => {
        setSelectedOption(selectedOption.value);
        console.log(selectedOption);
      };

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Apellido',
            selector: row => row.lastName,
            sortable: true,
        },
        {
            name: 'Documento',
            selector: row => row.document,
            sortable: true,
        },
        {
            name: 'Email',
            selector: row => row.email,
            sortable: true,
        },
        {
            name: 'Numero de telefono',
            selector: row => row.phoneNumber,
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
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
                await studentsService.editStudent(studentId, body);
                setEdit(false);
            }else {
                await studentsService.newStudent(body);
            }
            const response = await studentsService.getStudents();
            setStudents(response);
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            setIsLoading(false);
            setDisplayModal(false);
          }
        },
      });

    useEffect(() => {
        const getStudents = async () => {
            try{
                const response = await studentsService.getStudents();
                setStudents(response);
            }catch {
                setOpResult('No fue posible obtener los alumnos, por favor recargue la página...')
            }
        }
        getStudents();
      }, [])

      useEffect(() => {
        const getCourses = async () => {
            const coursesList = await coursesService.getCourses();
            console.log(coursesList)
            coursesList.forEach(course => {
                course.label = course.title;
                course.value = course.id;
            })
            setCourses(coursesList);
        }
        getCourses();
      }, [])
    /*const white = orange[50];*/

    return(
        <>
            <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Alumnos</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    <DataTable
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
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                    Asignar cursos
                                </label>
                                <Select isMulti onChange={handleChange} options={courses} />
                        </div>
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar alumno" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={() => deleteStudent()} children={<><div>Esta a punto de elimnar este alumno. ¿Desea continuar?</div></>} />
            </div>    
        </>
    );
} 