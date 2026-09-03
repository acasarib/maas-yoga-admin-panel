import React, { useState, useEffect, useContext } from "react";
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RestoreIcon from '@mui/icons-material/Restore';
import Modal from "../components/modal";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import CustomCheckbox from "../components/checkbox/customCheckbox";
import CustomRadio from "../components/radio/customRadio";
import { Context } from "../context/Context";
import Table from "../components/table";
import Container from "../components/container";
import NoDataComponent from "../components/table/noDataComponent";
import GroupIcon from '@mui/icons-material/Group';
import PlusButton from "../components/button/plus";
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteButton from "../components/button/deleteButton";
import EditButton from "../components/button/editButton";
import RestoreButton from "../components/button/restoreButton";
import Label from "../components/label/label";
import { COLORS } from "../constants";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

export default function NewUser(props) {

    const [disabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [canCreateUser, setCanCreateUser] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [restoreModal, setRestoreModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [userEmail, setUserEmail] = useState(null); 
    const [googleDriveAccess, setGoogleDriveAccess] = useState(false);
    const [userRole, setUserRole] = useState('operator');
    const [userToEdit, setUserToEdit] = useState({});
    const [userToDelete, setUserToDelete] = useState('');
    const [userToRestore, setUserToRestore] = useState('');
    const [restorePass, setRestorePass] = useState(false);
    const [displayModal, setDisplayModal] = useState(false);
    const [editPass, setEditPass] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const { changeAlertStatusAndMessage, deleteUser, editUser, newUser, users, deletedUsers, restoreUser, isAuditor } = useContext(Context);
    const [opResult, setOpResult] = useState('Verificando usuarios...');

    const currentUsers = activeTab === 0 ? users : deletedUsers;

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

  const openRestoreModal = (user) => {
    setRestoreModal(true);
    setUserEmail(user.email);
    setUserToRestore(user.firstName + ' ' + user.lastName)
  }

const openEditModal = async (user) => {
    if (isAuditor()) {
      changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden editar usuarios');
      return;
    }
    setUserToEdit(user);
    setEdit(true);
    setDisplayModal(true);
  }

const handleDeleteUser = async (email) => {
  if (isAuditor()) {
    changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden eliminar usuarios');
    return;
  }
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

const handleRestoreUser = async (email) => {
  if (isAuditor()) {
    changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden restaurar usuarios');
    return;
  }
  setIsLoading(true);
  try{
      await restoreUser(userEmail);
      changeAlertStatusAndMessage(true, 'success', 'Usuario restaurado con éxito!');
  }catch {
      changeAlertStatusAndMessage(true, 'error', 'El usuario no pudo ser restaurado... Por favor inténtelo nuevamente.');
  }
  setIsLoading(false);
  setRestoreModal(false);
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
              <div style={{ backgroundColor: COLORS.primary[200] }} className="opacity-0 w-28 text-gray-700 text-xs rounded-lg py-2 absolute z-10 group-hover:opacity-100 bottom-full -left-1/2 ml-14 px-3 pointer-events-none">
                {row.email}
                <svg className="absolute h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon fill={COLORS.primary[200]} points="0,0 127.5,127.5 255,0"/></svg>
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
      cell: row => {
        if (isAuditor()) return null;
        if (activeTab === 0) {
          return (<div className="flex-row"><DeleteButton onClick={() => openDeleteModal(row)}/><EditButton onClick={() => openEditModal(row)} /></div>);
        } else {
          return (<div className="flex-row"><RestoreButton onClick={() => openRestoreModal(row)}/></div>);
        }
      },
      sortable: true,
    },
  ];

  useEffect(() => {
   if(userToEdit.permissionCreateUser) setCanCreateUser(userToEdit.permissionCreateUser);
   if(userToEdit.permissionGoogleDrive) setGoogleDriveAccess(userToEdit.permissionGoogleDrive);
   if(userToEdit.role) setUserRole(userToEdit.role);
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
        if (isAuditor()) {
          changeAlertStatusAndMessage(true, 'warning', 'Los auditores no pueden crear ni editar usuarios');
          setDisplayModal(false);
          return;
        }
        const body = {
          email: values.email,
          lastName: values.lastName,
          firstName: values. firstName,
          permissionCreateUser: canCreateUser,
          permissionGoogleDrive: googleDriveAccess,
          role: userRole,
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
            <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)} className="mb-4">
              <Tab label="Activos" />
              <Tab label="Eliminados" />
            </Tabs>
            <Table
              columns={columns}
              data={currentUsers}
              pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
              responsive
              noDataComponent={<NoDataComponent Icon={GroupIcon} title={activeTab === 0 ? "No hay usuarios" : "No hay usuarios eliminados"} subtitle={activeTab === 0 ? "No se encontraron usuarios registrados" : "No se encontraron usuarios eliminados"}/>}
            />
            {!isAuditor() && (
              <div className="flex justify-end mt-6">
                <PlusButton onClick={() => setDisplayModal(true)}/>
              </div>
            )}
        </Container>
        <Modal danger icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteUser} children={<><div>Esta a punto de elimnar el usuario <span className="font-bold">{userToDelete}</span>. ¿Desea continuar?</div></>} />
        <Modal icon={<RestoreIcon />} open={restoreModal} setDisplay={(v) => {setRestoreModal(v); setDisplay(v);}} title="Restaurar usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Restaurando...</span></>) : <span>Restaurar</span>} onClick={handleRestoreUser} children={<><div>Esta a punto de restaurar el usuario <span className="font-bold">{userToRestore}</span>. ¿Desea continuar?</div></>} />
        <Modal icon={<PersonAddIcon />} buttonDisabled={edit ? false : disabled} open={displayModal} setDisplay={setDisplay} title="Nuevo usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">{edit ? 'Editando...' : 'Agregando...'}</span></>) : <span>{edit ? 'Editar' : 'Agregar'}</span>} onClick={formik.handleSubmit} children={<>
                <form className="flex flex-col gap-6"   
                    method="POST"
                    id="form"
                    autoComplete="off"
                    onSubmit={formik.handleSubmit}
                >
                  <div>
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
              
                  <div>
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
                
                <div>
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

              <div>
                {edit && (<>
                  <Label>Contraseña</Label>
                  <div className="flex flex-col gap-2">
                    <CustomCheckbox
                      checked={restorePass}
                      onChange={(e) => setRestorePass(e.target.checked)}
                      label="Reseteo de contraseña"
                    />
                    <CustomCheckbox
                      checked={editPass}
                      onChange={(e) => setEditPass(e.target.checked)}
                      label="Editar contraseña"
                    />
                  </div>
                  </>)
                }
                    {((edit && editPass) || !edit) && (<div>
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
                    </div>)}
                  </div>
                  <div>
                    <Label>Atributos</Label>
                    <div className="flex flex-col gap-2">
                      <Label>Rol</Label>
                      <ul className="mt-3 flex flex-col max-w-md">
                        {[
                          {
                            value: 'operator',
                            title: 'Operador',
                            description: 'Gestión completa: crear/editar usuarios, cursos, pagos, reportes',
                            icon: (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: userRole === 'operator' ? COLORS.primary[500] : COLORS.primary[100] }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: userRole === 'operator' ? 'white' : COLORS.primary[600] }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                              </div>
                            ),
                          },
                          {
                            value: 'auditor',
                            title: 'Auditor',
                            description: 'Solo lectura: visualiza reportes, estudiantes, pagos sin editar',
                            icon: (
                              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: userRole === 'auditor' ? COLORS.primary[500] : COLORS.primary[200] }}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: userRole === 'auditor' ? 'white' : COLORS.primary[700] }}>
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                            ),
                          },
                        ].map((option, i) => {
                          const isSelected = userRole === option.value;
                          const optionId = `role-option-${option.value}`;
                          const baseClasses = 'inline-flex items-center gap-x-2 py-3 px-4 text-sm font-medium border border-gray-200 text-gray-800 -mt-px first:rounded-t-lg first:mt-0 last:rounded-b-lg transition-colors';
                          const selectedClasses = isSelected ? ' border-primary-500 bg-primary-50 text-primary-600 shadow-sm' : '';
                          const liStyle = {};
                          if (isSelected) {
                            liStyle.backgroundColor = COLORS.primary[100];
                            liStyle.borderColor = COLORS.primary[600];
                          }
                          const previousSelected = i > 0 && userRole === option.value;
                          if (previousSelected) {
                            liStyle.borderTop = "none";
                          }

                          return (
                            <li
                              key={option.value}
                              style={liStyle}
                              className={`${baseClasses}${selectedClasses} cursor-pointer hover:bg-gray-50`}
                            >
                              <div className="relative flex items-center w-full">
                                <div className="flex items-center h-5">
                                  <CustomRadio
                                    id={optionId}
                                    name="role-option"
                                    value={option.value}
                                    checked={isSelected}
                                    onChange={(e) => setUserRole(e.target.value)}
                                    label={null}
                                  />
                                </div>
                                <label htmlFor={optionId} className="block w-full">
                                  <div className="flex items-start">
                                    <div className="flex flex-col">
                                      <span className="flex items-center font-medium text-gray-900">
                                        {option.title}
                                        <div className="flex-shrink-0 ml-2">
                                          {option.icon}
                                        </div>
                                      </span>
                                      <span className="text-sm text-gray-500 mt-1">
                                        {option.description}
                                      </span>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                      <FormGroup>
                        <FormControlLabel control={<Checkbox  checked={canCreateUser} onChange={(e) => setCanCreateUser(e.target.checked)} sx={{
                          color: COLORS.primary[500],
                          '&.Mui-checked': {
                            color: COLORS.primary[500],
                          },
                        }} />} label="Permitir crear usuarios" />
                      </FormGroup>
                      <FormGroup>
                        <FormControlLabel control={<Checkbox  checked={googleDriveAccess} onChange={(e) => setGoogleDriveAccess(e.target.checked)} sx={{
                          color: COLORS.primary[500],
                          '&.Mui-checked': {
                            color: COLORS.primary[500],
                          },
                        }} />} label="Acceso a Google Drive" />
                      </FormGroup>
                    </div>
                  </div>
                </form>
        </>} />
      </>
    );
} 