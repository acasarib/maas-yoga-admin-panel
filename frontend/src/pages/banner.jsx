import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import authUser from '../services/userService';
import CommonAlert from "../components/commonAlert";
import CommonInput from "../components/commonInput";

export default function Banner() {   
    const [hideBanner, setHideBanner] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    let navigate = useNavigate();

    const isAuthFail = {
        title: 'Usuario o contraseña incorrectos',
        message: 'Alguno de los campos indicados no posee los datos correctos'
    };

    const validate = (values) => {
        const errors = {};
        if (!values.email) {
          errors.email = 'Campo requerido';
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
          try {
            const token = await authUser.authUser(body);
            localStorage.setItem('accessToken', token);
            navigate('/home');
          } catch (error) {
            setShowAlert(true);
            console.log(error);
          }
        },
      });
    
    return(
        <>
            <div className="bg-gradient-to-b from-yellow-300 to-white h-screen w-screen grid content-center flex justify-center">
                {showAlert && (<div className=""><CommonAlert title={isAuthFail.title} message={isAuthFail.message} color="red" /></div>)
                }
                {!hideBanner ? <><div>
                    <button className="transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-125" onClick={() => setHideBanner(true)}>
                        <img
                            src="\assets\images\maas_3colores.png"
                            width={594}
                            height={200}
                            alt="Maas Yoga logo"
                            className="hidden md:block"
                        />
                        <img
                            src="\assets\images\maas_3colores.png"
                            width={297}
                            height={100}
                            alt="Maas Yoga logo"
                            className="md:hidden block"
                        />
                    </button>
                </div></> : <>
                    <img
                            src="\assets\images\maas_3colores.png"
                            width={297}
                            height={100}
                            alt="Maas Yoga logo"
                            className="mb-8 mx-auto text-focus-in"
                    />
                <div className="scale-up-center w-80 md:w-96 h-auto mx-auto">
                    <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"    
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
                        <div className="flex items-center justify-between">
                        <button disabled={disabled} className={disabled ? "bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "bg-purple-400 hover:bg-purple-950 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}  type="submit">
                            Ingresar
                        </button>
                        <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
                            Olvidaste tu contraseña?
                        </a>
                        </div>
                    </form>
                </div></>
                } 
            </div>    
        </>
    );
} 