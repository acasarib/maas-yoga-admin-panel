import React, { useState, useEffect, useContext } from "react";
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Modal from "../components/modal";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { Context } from "../context/Context";
import Table from "../components/table";
import { orange } from '@mui/material/colors';
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function NewUser(props) {

    const [disabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [canCreateUser, setCanCreateUser] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [userEmail, setUserEmail] = useState(null); 
    const [googleDriveAccess, setGoogleDriveAccess] = useState(false);
    const [userToEdit, setUserToEdit] = useState({});
    const [userToDelete, setUserToDelete] = useState('');
    const [restorePass, setRestorePass] = useState(false);
    const [displayModal, setDisplayModal] = useState(false);
    const [editPass, setEditPass] = useState(false);
    const { changeAlertStatusAndMessage, deleteUser, editUser, newUser, users } = useContext(Context);
    const [opResult, setOpResult] = useState('Verificando usuarios...');

    const setDisplay = (value) => {
      setDisplayModal(value);
      setEdit(value);
      setUserToEdit({});
      setRestorePass(false);
      setEditPass(false);
      setDeleteModal(value);
  }

  const openDeleteModal = (user) => {
    setDeleteModal(true);
    setUserEmail(user.email);
    setUserToDelete(user.firstName + ' ' + user.lastName)
  }

const openEditModal = async (user) => {
    setUserToEdit(user);
    setEdit(true);
    setDisplayModal(true);
}

const handleDeleteUser = async (email) => {
  setIsLoading(true);
  try{
      await deleteUser(userEmail);
      changeAlertStatusAndMessage(true, 'success', 'Usuario eliminado con éxitosamente!');
  }catch {
      changeAlertStatusAndMessage(true, 'error', 'El usuario no pudo ser eliminado... Por favor inténtelo nuevamente.');
  }
  setIsLoading(false);
  setDeleteModal(false);
}

const validate = (values) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Campo requerido';
      setDisabled(true);
    } else if (!edit && !values.password) {
      errors.password = 'Campo requerido';
      setDisabled(true);
    } else if (!values.lastName) {
      errors.password = 'Campo requerido';
      setDisabled(true);
    } else if (!values.firstName) {
      errors.password = 'Campo requerido';
      setDisabled(true);
    } else if (!edit && values.password.length < 3) {
      errors.password = 'Te falta completar los 3 dígitos';
      setDisabled(true);
    } else {
      setDisabled(false);
    }
    return errors;
};

    const columns = [
      {
          name: 'Nombre',
          selector: row => row.firstName,
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
        name: 'Fecha de creacion',
        selector: row => {var dt = new Date(row.createdAt);
            let year  = dt.getFullYear();
            let month = (dt.getMonth() + 1).toString().padStart(2, "0");
            let day   = dt.getDate().toString().padStart(2, "0");
            var date = day + '/' + month + '/' + year; return date},
        sortable: true,
    },
    {
      name: 'Acciones',
      cell: row => { return (<div className="flex-row"><button className="rounded-full p-1 bg-red-200 hover:bg-red-300 mx-1" onClick={() => openDeleteModal(row)}><DeleteIcon /></button><button className="rounded-full p-1 bg-orange-200 hover:bg-orange-300 mx-1" onClick={() => openEditModal(row)}><EditIcon /></button></div>)
      },
      sortable: true,
    },
  ];

  useEffect(() => {
   if(userToEdit.permissionCreateUser) setCanCreateUser(userToEdit.permissionCreateUser);
   if(userToEdit.permissionGoogleDrive) setGoogleDriveAccess(userToEdit.permissionGoogleDrive);
  }, [userToEdit])
  

    const formik = useFormik({
      enableReinitialize: true,
      initialValues: {
        email: edit ? userToEdit.email : '',
        firstName: edit ? userToEdit.firstName : '',
        lastName: edit ? userToEdit.lastName : '',
        password: ''
      },
      validate,
      onSubmit: async (values) => {
        const body = {
          email: values.email,
          lastName: values.lastName,
          firstName: values. firstName,
          permissionCreateUser: canCreateUser,
          permissionGoogleDrive: googleDriveAccess,
        };
        setIsLoading(true);
        try {
          console.log(edit, 'hola');
          if(edit) {
            if(restorePass) body.password = null;
            if(editPass) body.password = values.password;
            await editUser(userToEdit.email, body);
            setEdit(false);
            setUserToEdit({});
            setRestorePass(false);
            setEditPass(false);
          }else {
            body.password = values.password;
            await newUser(body);
            changeAlertStatusAndMessage(true, 'success', 'El usuario fue creado con éxito!');
          }
          setDisplayModal(false);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          changeAlertStatusAndMessage(true, 'error', 'El usuario no pudo ser creado... por favor inténtelo nuevamente.');
          setDisplayModal(false);
        }
        setCanCreateUser(false);
        formik.values = {};
      },
    });

    useEffect(() => {
      setOpResult('No fue posible obtener los usuarios, por favor recargue la página...');
    }, [])

    return(
        <>
        <Container title="Usuarios">
            <Table
              columns={columns}
              data={users}
              pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
              responsive
              noDataComponent={opResult}
            />
            <div className="flex justify-end mt-6">
              <PlusButton onClick={() => setDisplayModal(true)}/>
            </div>
        </Container>
        <Modal icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteUser} children={<><div>{`Esta a punto de elimnar el usuario ${userToDelete}. ¿Desea continuar?`}</div></>} />
        <Modal icon={<PersonAddIcon />} buttonDisabled={edit ? false : disabled} open={displayModal} setDisplay={setDisplay} title="Nuevo usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                <form className="pt-6 mb-4 sm:mx-auto"    
                    method="POST"
                    id="form"
                    autoComplete="off"
                    onSubmit={formik.handleSubmit}
                >
                  <div className="mb-4 flex flex-col sm:flex-row w-full">
                      <div className="w-full mb-4 sm:mb-0 sm:mr-1">
                          <CommonInput 
                              label="Nombre"    
                              onBlur={formik.handleBlur}
                              value={formik.values.firstName}
                              name="firstName"
                              htmlFor="firstName"
                              id="firstName" 
                              type="text" 
                              placeholder="Nombre" 
                              onChange={formik.handleChange}
                          />
                          {formik.touched.firstName && formik.errors.firstName ? (
                              <div className="text-red-500">{formik.errors.firstName}</div>
                          ) : null}
                      </div>
                      <div className="sm:w-full sm:ml-1">
                          <CommonInput 
                              label="Apellido"    
                              onBlur={formik.handleBlur}
                              value={formik.values.lastName}
                              name="lastName"
                              htmlFor="lastName"
                              id="lastName" 
                              type="text" 
                              placeholder="Apellido" 
                              onChange={formik.handleChange}
                          />
                        {formik.touched.lastName && formik.errors.lastName ? (
                            <div className="text-red-500">{formik.errors.lastName}</div>
                        ) : null}
                      </div>
                  </div>
                  <div className="mb-4">
                      <CommonInput 
                          label="Email"    
                          onBlur={formik.handleBlur}
                          value={formik.values.email}
                          name="email"
                          htmlFor="email"
                          id="email" 
                          autoComplete="new-password"
                          type="text" 
                          placeholder="Email" 
                          role="presentation"
                          onChange={formik.handleChange}
                      />
                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500">{formik.errors.email}</div>
                    ) : null}
                  </div>
                  <div className="mb-6">
                  {edit && (<>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Contraseña
                    </label>
                  <div className="flex flex-wrap gap-2"><FormGroup>
                    <FormControlLabel control={<Checkbox  checked={restorePass} onChange={(e) => setRestorePass(e.target.checked)} sx={{
                      color: orange[500],
                      '&.Mui-checked': {
                        color: orange[500],
                      },
                    }} />} label="Reseteo de contraseña" />
                  </FormGroup>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox  checked={editPass} onChange={(e) => setEditPass(e.target.checked)} sx={{
                      color: orange[500],
                      '&.Mui-checked': {
                        color: orange[500],
                      },
                    }} />} label="Editar contraseña" />
                  </FormGroup>
                  </div>
                  </>)}
                    {((edit && editPass) || !edit) && (<>
                      <CommonInput 
                        label="Contraseña"    
                        onBlur={formik.handleBlur}
                        value={formik.values.password}
                        name="password"
                        htmlFor="password"
                        autoComplete="new-password"
                        id="password" 
                        type="password" 
                        role="presentation"
                        placeholder="******************"
                        onChange={formik.handleChange}
                    />
                   {formik.touched.password && formik.errors.password ? (
                       <div className="text-red-500">{formik.errors.password}</div>
                   ) : null}
                    </>)}
                  </div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                      Atributos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <FormGroup>
                      <FormControlLabel control={<Checkbox  checked={canCreateUser} onChange={(e) => setCanCreateUser(e.target.checked)} sx={{
                        color: orange[500],
                        '&.Mui-checked': {
                          color: orange[500],
                        },
                      }} />} label="Permitir crear usuarios" />
                    </FormGroup>
                    <FormGroup>
                      <FormControlLabel control={<Checkbox  checked={googleDriveAccess} onChange={(e) => setGoogleDriveAccess(e.target.checked)} sx={{
                        color: orange[500],
                        '&.Mui-checked': {
                          color: orange[500],
                        },
                      }} />} label="Acceso a Google Drive" />
                    </FormGroup>
                  </div>
                </form>
        </>} />
      </>
    );
} 