import React, { useState, useEffect } from "react";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import coursesService from "../services/coursesService";
import DataTable from 'react-data-table-component';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import Select from 'react-select';
import studentsService from '../services/studentsService';
import SchoolIcon from '@mui/icons-material/School';

export default function Courses(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startAt, setStartAt] = useState(new Date());
    const [courses, setCourses] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [courseId, setCourseId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando cursos...');
    const [edit, setEdit] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState({});
    const [students, setStudents] = useState([]);
    const [selectedOption, setSelectedOption] = useState([]);
    const [displayStudentsModal, setDisplayStudentsModal] = useState(false);
    const [studentsLists, setStudentsLists] = useState([]);
    const [courseName, setCourseName] = useState("");
    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
        setDisplayStudentsModal(value);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setCourseId(id);
    }

    const deleteCourse = async () => {
        setIsLoading(true);
        await coursesService.deleteCourse(courseId);
        setIsLoading(false);
        setDeleteModal(false);
        const response = await coursesService.getCourses();
        setCourses(response);
    }

    const openEditModal = (course) => {
        setEdit(true);
        setDisplayModal(true);
        setCourseId(course.id);
        setCourseToEdit(course);
    }

    const openStudentsModal = (students, courseName) => {
        setDisplayStudentsModal(true);
        setStudentsLists(students);
        setCourseName(courseName);
    }

    var handleChange = (selectedOpt) => {
        let arr = [];
        selectedOpt.forEach(opt => {
            arr.push(opt.id);
        })
        setSelectedOption(arr)
    };

    const columns = [
        {
            name: 'Título',
            selector: row => row.title,
            sortable: true,
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
        {
            name: 'Alumnos',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openStudentsModal(row.students, row.title)}>Ver alumnos</button></div>)},
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const studentsColumns = [
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
        },
        {
            name: 'Numero de telefono',
            selector: row => row.phoneNumber,
            sortable: true,
        },
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            title: edit ? courseToEdit.title : '',
            description: edit ? courseToEdit.description : '',
            startAt: edit ? courseToEdit.startAt : startAt,
            duration: edit ? courseToEdit.duration : ''
        },
        onSubmit: async (values) => {
          const body = {
            title: values.title,
            description: values.description,
            startAt: startAt,
            duration: values.duration
          };
          setIsLoading(true);
          try {
            if(edit) {
                await coursesService.editCourse(courseId, body);
                setEdit(false);
            }else{
                await coursesService.newCourse(body);
            }
            if(selectedOption.length > 0) {
                await coursesService.addStudent(courseId, selectedOption);
            }
            const response = await coursesService.getCourses();
            setCourses(response);
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            setIsLoading(false);
            setDisplayModal(false);
          }
          formik.values = {};
        },
      });

    useEffect(() => {
        console.log('Cantidad seleccionada ' + selectedOption.length + '...');
    }, [selectedOption])

      useEffect(() => {
        const getCourses = async () => {
            try{
                const response = await coursesService.getCourses();
                setCourses(response);
            }catch {
                setOpResult('No fue posible obtener los cursos, por favor recargue la página...')
            }
        }
        getCourses();
      }, []);

      useEffect(() => {
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name;
                student.value = student.id;
            })
            setStudents(studentsList);
        }
        getStudents();
      }, [])

    /*const white = orange[50];*/

    return(
        <>
            <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Cursos</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    <DataTable
                        columns={columns}
                        data={courses}
                        noDataComponent={opResult}
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setDisplayModal(true)}
                            className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
                <Modal icon={<LocalLibraryIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar curso' : 'Agregar curso'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
                    <form className="pr-8 pt-6 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <CommonInput 
                                    label="Título"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.title}
                                    name="title"
                                    htmlFor="title"
                                    id="title" 
                                    type="text" 
                                    placeholder="Título" 
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="mb-4">
                            <CommonInput 
                                    label="Descripción"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    name="description"
                                    htmlFor="description"
                                    id="description" 
                                    type="text" 
                                    placeholder="Descripción"
                                    onChange={formik.handleChange}
                            />
                            </div>
                            <div className="mb-4 relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                    Fecha de inicio
                                </label>
                                <DatePicker selected={startAt} onChange={(date) => setStartAt(date)} />
                            </div>
                            <div className="mb-4">
                                <CommonInput 
                                    label="Duración"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.duration}
                                    name="duration"
                                    htmlFor="duration"
                                    id="duration" 
                                    type="text" 
                                    placeholder="Duración" 
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                    Asignar alumnos
                                </label>
                                <Select isMulti onChange={handleChange} options={students} />
                        </div>
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar curso" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={() => deleteCourse()} children={<><div>Esta a punto de elimnar este curso. ¿Desea continuar?</div></>} />
                <Modal style={{ minWidth: '750px' }} hiddingButton icon={<SchoolIcon />} open={displayStudentsModal} setDisplay={setDisplay} closeText="Salir" title={'Alumnos del curso ' + '"' + courseName + '"'} children={<><div>   <DataTable
                        columns={studentsColumns}
                        data={studentsLists}
                        noDataComponent="Este curso aun no posee alumnos"
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    /></div></>} />
            </div>    
        </>
    );
} 