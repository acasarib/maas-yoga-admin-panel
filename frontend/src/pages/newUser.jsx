import React, { useState } from "react";
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function NewUser(props) {

    const [disabled, setDisabled] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const validate = (values) => {
        const errors = {};
        if (!values.email) {
          errors.email = 'Campo requerido';
          setDisabled(true);
        } else if (!values.password) {
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
          password: '',
        },
        validate,
        onSubmit: async (values) => {
          const body = {
            email: values.email,
            password: values.password,
          };
          setIsLoading(true);
          try {
           // const response = await authUser.authUser(body);
           console.log(body)
            setIsLoading(true);
          } catch (error) {
            setIsLoading(false);
          }
        },
      });

    return(
        <>
            <div className="md:mx-32 bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <div className="flex-row">
                    <span className="mx-auto h-12 w-12 p-2 rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
                        <span className="mb-2"><PersonAddIcon /></span>
                    </span><span className="text-2xl md:text-3xl font-bold text-yellow-900 ml-4 mt-4">Nuevo usuario</span>
                </div>
                    <form className="pr-8 pt-6 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="mb-4">
                            <CommonInput 
                                label="Usuario"    
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                name="email"
                                htmlFor="email"
                                id="email" 
                                type="text" 
                                placeholder="Usuario" 
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
                            <button disabled={disabled} className={disabled ? "bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "bg-orange-200 hover:bg-orange-550 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}  type="submit">
                                {isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Agregando...</span></>) : <span>Agregar</span>}
                            </button>
                    </form>
            </div>
        </>
    );
} 