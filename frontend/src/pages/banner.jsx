import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from 'formik';
import authUser from '../services/userService';
import CommonAlert from "../components/commonAlert";

export default function Banner() {   
    const [hideBanner, setHideBanner] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [showAlert, setShowAlert] = useState(false);
    let navigate = useNavigate();

    const validate = (values) => {
        const errors = {};
        if (!values.userName) {
          errors.userName = 'Campo requerido';
          setDisabled(true);
        } else if (values.password.length < 4) {
          errors.password = 'Te falta completar los 4 dígitos';
          setDisabled(true);
        } else {
          setDisabled(false);
        }
        return errors;
      };
    
      const formik = useFormik({
        initialValues: {
          userName: '',
          password: '',
        },
        validate,
        onSubmit: async (values) => {
          const body = {
            userName: values.userName,
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
                {showAlert && (<CommonAlert />)
                }
                {!hideBanner ? <><div>
                    <button className="transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-125" onClick={() => setHideBanner(true)}>
                        <img
                            src="\assets\images\maas_3colores.png"
                            width={594}
                            height={200}
                            alt="Maas Yoga logo"
                            class="hidden md:block"
                        />
                        <img
                            src="\assets\images\maas_3colores.png"
                            width={297}
                            height={100}
                            alt="Maas Yoga logo"
                            class="md:hidden block"
                        />
                    </button>
                </div></> : <>
                    <img
                            src="\assets\images\maas_3colores.png"
                            width={297}
                            height={100}
                            alt="Maas Yoga logo"
                            class="mb-8 mx-auto text-focus-in"
                    />
                <div class="scale-up-center w-80 md:w-96 h-auto">
                    <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div class="mb-4">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                            Usuario
                        </label>
                        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Usuario" onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.dni}
                            name="userName"
                            htmlFor="userName"
                        />
                        {formik.touched.userName && formik.errors.userName ? (
                            <div className="text-red-500">{formik.errors.userName}</div>
                        ) : null}
                        </div>
                        <div class="mb-6">
                        <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                            Contraseña
                        </label>
                        <input class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" 
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.password}
                            name="password"
                            htmlFor="password"
                        />
                        {formik.touched.password && formik.errors.password ? (
                            <div className="text-red-500">{formik.errors.password}</div>
                        ) : null}
                        </div>
                        <div class="flex items-center justify-between">
                        <button disabled={disabled} class={disabled ? "bg-gray-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "bg-purple-400 hover:bg-purple-950 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}  type="submit">
                            Ingresar
                        </button>
                        <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
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