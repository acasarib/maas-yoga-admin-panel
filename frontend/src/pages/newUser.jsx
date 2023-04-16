import React, { useState } from "react";
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import userService from "../services/userService";
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

export default function NewUser(props) {

    const [disabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [canCreateUser, setCanCreateUser] = useState(false);

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
            await userService.createUser(body);
            console.log(body)
            setIsLoading(false);
          } catch (error) {
            setIsLoading(false);
          }
          setCanCreateUser(false);
          formik.values = {};
        },
      });

    return(
        <>
        <div className="px-6 py-8 max-w-6xl mx-auto">
            <div className="md:mx-32 bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <div className="flex-row">
                    <span className="mx-auto h-12 w-12 p-2 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                        <span className=""><PersonAddIcon /></span>
                    </span><span className="text-2xl md:text-3xl font-bold text-yellow-900 ml-4 mt-4">Nuevo usuario</span>
                </div>
                    <form className="pt-6 mb-4 mx-auto w-4/6"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                           <div className="mb-4">
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
                        <div className="mb-4">
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
                          <FormControlLabel control={<Checkbox  checked={canCreateUser} onChange={(e) => setCanCreateUser(e.target.checked)} />} label="Permitir crear usuarios" />
                        </FormGroup>
                            <button disabled={disabled} className={disabled ? "bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2" : "bg-orange-200 hover:bg-orange-550 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"}  type="submit">
                                {isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Agregando...</span></>) : <span>Agregar</span>}
                            </button>
                    </form>
            </div>
          </div>
        </>
    );
} 