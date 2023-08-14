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

export default function Students(props) {
    const { professors, isLoadingProfessors, deleteProfessor, editProfessor, newProfessor, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [professorId, setProfessorId] = useState(null);
    const [opResult, setOpResult] = useState('Verificando profesores...');
    const [edit, setEdit] = useState(false);
    const [professorToEdit, setProfessorToEdit] = useState({});
    const [matches, setMatches] = useState(
        window.matchMedia("(min-width: 700px)").matches
    )

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
            name: 'Acciones',
            cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row.id)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
        },
            sortable: true,
        },
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: edit ? professorToEdit.name : '',
            surname: edit ? professorToEdit.lastName : '',
        },
        onSubmit: async (values) => {
          const body = {
            name: values.name,
            lastName: values.surname,
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

    /*const white = orange[50];*/

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
                    </form>
                </>
                } />
                <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar profesor" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteProfessor} children={<><div>Esta a punto de elimnar este profesor. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 