import React, { useState, useEffect, useContext } from "react";
import Modal from "../components/modal";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import Table from "../components/table";
import { Context } from "../context/Context";
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import Select from "../components/select/select";

export default function Colleges(props) {
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { courses, colleges, isLoadingColleges, deleteCollege, editCollege, addCoursesToCollege, newCollege, changeAlertStatusAndMessage } = useContext(Context);
    const [deleteModal, setDeleteModal] = useState(false);
    const [collegeId, setCollegeId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando cursos...');
    const [edit, setEdit] = useState(false);
    const [collegeToEdit, setCollegeToEdit] = useState({});
    const [selectedOption, setSelectedOption] = useState([]);
    const [displayCoursesModal, setDisplayCoursesModal] = useState(false);
    const [coursesList, setCoursesList] = useState([]);
    const [collegeName, setCollegeName] = useState("");
    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
        setDisplayCoursesModal(value);
    }

    const openDeleteModal = (id) => {
        setDeleteModal(true);
        setCollegeId(id);
    }

    const handleDeleteCollege = async () => {
        setIsLoading(true);
        try{
            await deleteCollege(collegeId);
        }catch{
            changeAlertStatusAndMessage(true, 'error', 'La sede no pudo ser eliminada... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setDeleteModal(false);
        setCollegeId(null);
    }

    const openEditModal = (college) => {
        setEdit(true);
        setDisplayModal(true);
        setCollegeId(college.id);
        setCollegeToEdit(college);
    }

    const openCoursesModal = (courses, collegeName) => {
        setDisplayCoursesModal(true);
        setCoursesList(courses);
        setCollegeName(collegeName);
    }

    var handleChange = (selectedOpt) => {
        let arr = [];
        selectedOpt.forEach(opt => {
            arr.push(opt.id);
        })
        setSelectedOption(arr);
    };

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Ubicación',
            cell: row => {return (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.location}
                <div className="opacity-0 w-28 bg-orange-200 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.location}
                  <svg className="absolute text-orange-200 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>)},
            sortable: true,
        },
        {
            name: 'Cursos',
            selector: row => {return (<div className="flex-row"><button className="underline text-yellow-900 mx-1" onClick={() => openCoursesModal(row.courses, row.name)}>Ver cursos</button></div>)},
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
            selector: row => row.title,
            sortable: true,
            searchable: true,
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
            name: edit ? collegeToEdit.name : '',
            location: edit ? collegeToEdit.location : '',
        },
            onSubmit: async (values) => {
                const body = {
                  name: values.name,
                  location: values.location,
                };
                setIsLoading(true);
                try {
                  if(edit) {
                        await editCollege(collegeId, body);
                        setEdit(false);
                        if(selectedOption.length > 0) {
                            await addCoursesToCollege(collegeId, selectedOption);
                        }
                  }else{
                        const createdCollege = await newCollege(body);
                        setCollegeId(createdCollege.id);
                        if(selectedOption.length > 0) {
                            await addCoursesToCollege(createdCollege.id, selectedOption);
                        }
                  }
                  setIsLoading(false);
                  setDisplayModal(false);
                } catch (error) {
                changeAlertStatusAndMessage(true, 'error', 'La sede no pudo ser creada... Por favor inténtelo nuevamente.')
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
        if (colleges.length === 0 && !isLoadingColleges)
            setOpResult('No fue posible obtener las sedes, por favor recargue la página...')
    }, [colleges, isLoadingColleges]);

    /*const white = orange[50];*/

    return(
        <>
            <Container title="Sedes">
                <Table
                    columns={columns}
                    data={colleges}
                    noDataComponent={opResult}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
                <div className="flex justify-end mt-6">
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <Modal icon={<AccountBalanceIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar sede' : 'Agregar sede'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
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
                                    label="Ubicación"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.location}
                                    name="location"
                                    htmlFor="location"
                                    id="location" 
                                    type="text" 
                                    placeholder="Ubicación"
                                    onChange={formik.handleChange}
                            />
                            </div>
                        </div>
                        <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                                    Asignar cursos
                                </label>
                                <Select
                                    isMulti
                                    onChange={handleChange}
                                    options={courses}
                                    getOptionLabel ={(course)=> course.title}
                                    getOptionValue ={(course)=> course.id}
                                />
                        </div>
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar sede" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteCollege} children={<><div>Esta a punto de elimnar esta sede. ¿Desea continuar?</div></>} />
                <Modal style={{ minWidth: '750px' }} hiddingButton icon={<SchoolIcon />} open={displayCoursesModal} setDisplay={setDisplay} closeText="Salir" title={'Cursos de la sede ' + '"' + collegeName + '"'} children={<><div>   <Table
                        columns={coursesColumns}
                        data={coursesList}
                        noDataComponent="Este sede aun no posee cursos"
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    /></div></>} />
            </Container>
        </>
    );
} 