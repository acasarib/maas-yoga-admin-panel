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

export default function NewUser(props) {

    const [disabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [canCreateUser, setCanCreateUser] = useState(false);
    const [displayModal, setDisplayModal] = useState(false);
    const { changeAlertStatusAndMessage, newUser, users } = useContext(Context);
    const [opResult, setOpResult] = useState('Verificando usuarios...');

    const setDisplay = (value) => {
      setDisplayModal(value);
  }

    const validate = (values) => {
        const errors = {};
        if (!values.email) {
          errors.email = 'Campo requerido';
          setDisabled(true);
        } else if (!values.password) {
          errors.password = 'Campo requerido';
          setDisabled(true);
        } else if (!values.lastName) {
          errors.password = 'Campo requerido';
          setDisabled(true);
        } else if (!values.firstName) {
          errors.password = 'Campo requerido';
          setDisabled(true);
        } else if (values.password.length < 3) {
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
  ];

    const formik = useFormik({
      initialValues: {
        email: '',
        firstName: '',
        lastName: '',
        password: '',
      },
      validate,
      onSubmit: async (values) => {
        const body = {
          email: values.email,
          password: values.password,
          lastName: values.lastName,
          firstName: values. firstName,
          permissionCreateUser: canCreateUser
        };
        setIsLoading(true);
        try {
          await newUser(body);
          changeAlertStatusAndMessage(true, 'success', 'El usuario fue creado con éxito!');
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
            <div className="flex justify-end">
              <PlusButton onClick={() => setDisplayModal(true)}/>
            </div>
        </Container>
        <Modal icon={<PersonAddIcon />} buttonDisabled={disabled} open={displayModal} setDisplay={setDisplay} title="Nuevo usuario" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Agregando...</span></>) : <span>Agregar</span>} onClick={formik.handleSubmit} children={<>
                <form className="pt-6 mb-4 sm:mx-auto"    
                    method="POST"
                    id="form"
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
                          type="text" 
                          placeholder="Email" 
                          onChange={formik.handleChange}
                      />
                    {formik.touched.email && formik.errors.email ? (
                        <div className="text-red-500">{formik.errors.email}</div>
                    ) : null}
                  </div>
                  <div className="mb-6">
                    <CommonInput 
                            label="Contraseña"    
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            name="password"
                            htmlFor="password"
                            id="password" 
                            type="password" 
                            placeholder="******************"
                            onChange={formik.handleChange}
                    />
                    {formik.touched.password && formik.errors.password ? (
                        <div className="text-red-500">{formik.errors.password}</div>
                    ) : null}
                  </div>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox  checked={canCreateUser} onChange={(e) => setCanCreateUser(e.target.checked)} sx={{
                      color: orange[500],
                      '&.Mui-checked': {
                        color: orange[500],
                      },
                    }} />} label="Permitir crear usuarios" />
                  </FormGroup>
                </form>
        </>} />
      </>
    );
} 