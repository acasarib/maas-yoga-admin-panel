import React, { useState, useEffect, useContext } from "react";
import Modal from "../components/modal";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import Table from "../components/table";
import { Context } from "../context/Context";
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import Loader from "../components/spinner/loader";
import DeleteButton from "../components/button/deleteButton";
import EditButton from "../components/button/editButton";
import NoDataComponent from "../components/table/noDataComponent";
import { COLORS } from "../constants";

export default function Colleges(props) {
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { getColleges, isLoadingColleges, deleteCollege, editCollege, newCollege, changeAlertStatusAndMessage } = useContext(Context);
    const [deleteModal, setDeleteModal] = useState(false);
    const [collegeId, setCollegeId] = useState(null);
    const [collegeToDelete, setCollegeToDelete] = useState(null);
    const [edit, setEdit] = useState(false);
    const [collegeToEdit, setCollegeToEdit] = useState({});
    const [colleges, setColleges] = useState([]);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const openDeleteModal = (college) => {
        setDeleteModal(true);
        setCollegeId(college.id);
        setCollegeToDelete(college);
    }

    const handleDeleteCollege = async () => {
        setIsLoading(true);
        try{
            await deleteCollege(collegeId);
            setTimeout(() => {
                fetchColleges(true)
            }, 500);
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

    const columns = [
        {
            name: 'Nombre',
            selector: row => row.name,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Ubicación',
            cell: row => (<><div className="flex flex-col justify-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="group cursor-pointer relative inline-block">{row.location}
                <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                  {row.location}
                  <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
                </div>
              </div>
            </div>
          </div></>),
            sortable: true,
        },
        {
            name: 'Acciones',
            cell: row => (<div className="flex-row"><DeleteButton onClick={() => openDeleteModal(row)}/><EditButton onClick={() => openEditModal(row)} /></div>),
            sortable: true,
        },
    ];

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            name: edit ? collegeToEdit.name : '',
            location: edit ? collegeToEdit.location : '',
        },
            onSubmit: async (values, { resetForm }) => {
                const body = {
                  name: values.name,
                  location: values.location,
                };
                setIsLoading(true);
                try {
                    if(edit) {
                        const newColleges = await editCollege(collegeId, body);
                        setColleges(newColleges)
                        setEdit(false);
                    }else{
                        const newColleges = await newCollege(body);
                        setColleges(newColleges)
                    }
                    setIsLoading(false);
                    setDisplayModal(false);
                    resetForm();
                    fetchColleges(true)
                } catch (error) {
                changeAlertStatusAndMessage(true, 'error', 'La sede no pudo ser creada... Por favor inténtelo nuevamente.')
                  setIsLoading(false);
                  setDisplayModal(false);
                }
                formik.values = {};
              },
    });

    const fetchColleges = async (force) => {
        const colleges = await getColleges(force)        
        setColleges(colleges)
    }

    useEffect(() => {
        fetchColleges()
    }, []);

    return(
        <>
            <Container title="Sedes">
                <Table
                    progressPending={isLoadingColleges}
                    columns={columns}
                    data={colleges}
                    noDataComponent={<NoDataComponent Icon={AccountBalanceIcon} title="No hay sedes" subtitle="No se encontraron sedes registradas"/>}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                />
                <div className="flex justify-end mt-6">
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <Modal icon={<AccountBalanceIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar sede' : 'Agregar sede'} buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} children={<>
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
                    </form>
                </>
                } />
                <Modal danger icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar sede" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteCollege} children={<><div>Esta a punto de eliminar la sede <strong>{collegeToDelete?.name || 'esta sede'}</strong>. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 