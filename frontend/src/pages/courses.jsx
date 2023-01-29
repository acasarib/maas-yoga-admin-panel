import React, { useState } from "react";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";

export default function Courses(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const setDisplay = (value) => {
        setDisplayModal(value);
    }

    const formik = useFormik({
        initialValues: {
          email: '',
          password: '',
        },
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

    /*const white = orange[50];*/

    return(
        <>
            <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Cursos</h1>
                <div className="flex justify-end">
                    <button onClick={() => setDisplayModal(true)}
                            className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
                <Modal icon={<LocalLibraryIcon />} open={displayModal} setDisplay={setDisplay} title="Agregar curso" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Agregando...</span></>) : <span>Agregar</span>} children={<>
                    <form className="pr-8 pt-6 mb-4"    
                        method="POST"
                        id="form"
                        onSubmit={formik.handleSubmit}
                    >
                        <div className="grid grid-cols-2 gap-4">
                            <div className="mb-4">
                                <CommonInput 
                                    label="Título"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.title}
                                    name="title"
                                    htmlFor="title"
                                    id="title" 
                                    type="text" 
                                    placeholder="Título" 
                                    onChange={formik.handleChange}
                                />
                            </div>
                            <div className="mb-4">
                            <CommonInput 
                                    label="Descripción"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.description}
                                    name="description"
                                    htmlFor="description"
                                    id="description" 
                                    type="text" 
                                    placeholder="Descripción"
                                    onChange={formik.handleChange}
                            />
                            </div>
                            <div className="mb-4">
                            <CommonInput 
                                    label="Fecha de inicio"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.startAt}
                                    name="startAt"
                                    htmlFor="startAt"
                                    id="startAt" 
                                    type="text" 
                                    placeholder="Fecha de inicio"
                                    onChange={formik.handleChange}
                            />
                            </div>
                            <div className="mb-4">
                                <CommonInput 
                                    label="Duración"    
                                    onBlur={formik.handleBlur}
                                    value={formik.values.duration}
                                    name="duration"
                                    htmlFor="duration"
                                    id="duration" 
                                    type="text" 
                                    placeholder="Duración" 
                                    onChange={formik.handleChange}
                                />
                            </div>
                        </div>
                    </form>
                </>
                } />
            </div>    
        </>
    );
} 