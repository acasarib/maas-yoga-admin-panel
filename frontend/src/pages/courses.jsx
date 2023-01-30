import React, { useState, useEffect } from "react";
import Modal from "../components/modal";
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary';
import { useFormik } from 'formik';
import CommonInput from "../components/commonInput";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import coursesService from "../services/coursesService";
import DataTable from 'react-data-table-component';

export default function Courses(props) {

    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [startAt, setStartAt] = useState(new Date());
    const [courses, setCourses] = useState([]);
    const setDisplay = (value) => {
        setDisplayModal(value);
    }

    const columns = [
        {
            name: 'Titulo',
            selector: row => row.title,
            sortable: true,
        },
        {
            name: 'Descripcion',
            selector: row => row.description,
            sortable: true,
        },
        {
            name: 'Fecha de inicio',
            selector: row => row.startAt,
            sortable: true,
        },
        {
            name: 'Duracion',
            selector: row => row.duration,
            sortable: true,
        }
    ];

    const formik = useFormik({
        initialValues: {
            title: '',
            description: '',
            startAt: startAt,
            duration: ''
        },
        onSubmit: async (values) => {
          const body = {
            title: values.title,
            description: values.description,
            startAt: startAt,
            duration: values.duration
          };
          setIsLoading(true);
          try {
            await coursesService.newCourse(body);
            const response = await coursesService.getCourses();
            setCourses(response);
            setIsLoading(false);
            setDisplayModal(false);
          } catch (error) {
            setIsLoading(false);
            setDisplayModal(false);
          }
        },
      });

      useEffect(() => {
        const getCourses = async () => {
            const response = await coursesService.getCourses();
            setCourses(response);
        }
        getCourses();
      }, []);

    /*const white = orange[50];*/

    return(
        <>
            <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Cursos</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    <DataTable
                        columns={columns}
                        data={courses}
                        noDataComponent="Verificando cursos..."
                    />
                </div>
                <div className="flex justify-end">
                    <button onClick={() => setDisplayModal(true)}
                            className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
                <Modal icon={<LocalLibraryIcon />} onClick={formik.handleSubmit} open={displayModal} setDisplay={setDisplay} title="Agregar curso" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Agregando...</span></>) : <span>Agregar</span>} children={<>
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
                            <div className="mb-4 relative">
                                <label className="block text-gray-700 text-sm font-bold mb-2" for="email">
                                    Fecha de inicio
                                </label>
                                <DatePicker selected={startAt} onChange={(date) => setStartAt(date)} />
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