import React, { useEffect, useState } from "react";
import paymentsService from "../services/paymentsService";
import Select from 'react-select';
import studentsService from '../services/studentsService';
import coursesService from "../services/coursesService";
import CommonInput from "../components/commonInput";

export default function Payments(props) {

    const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = useState(false);
    const [fileName, setFilename] = useState("");
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [fileId, setFileId] = useState('');
    const [ammount, setAmmount] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [disabled, setDisabled] = useState(true);
    const handleFileChange = (e) => {
        if (e.target.files) {
          setFile([...file, e.target.files[0]]);
          setFilename(e.target.files[0].name);
          setHaveFile(true);
        }
    };

    const paymentOptions = [
        {
            label: 'Mercado pago',
            value: 'Mercado pago'
        },
        {
            label: 'Paypal',
            value: 'Paypal'
        },
        {
            label: 'Efectivo',
            value: 'Efectivo'
        }
    ]

    const uploadFile = async (file, fileName) => {
        const response = await paymentsService.uploadFile(file, fileName);
        setFileId(response.id);
        setFile([]);
        setHaveFile(false);
        //checkValues();
        setFilename("");
    }

    const deleteSelection = () => {
        setFile([]);
        setHaveFile(false);
        setFilename("");
    }

    const handleChangeStudent = (selectedOpt) => {
        setSelectedStudent(selectedOpt.id);
        //checkValues();
    };

    const handleChangeCourse = (selectedOpt) => {
        setSelectedCourse(selectedOpt.id);
        //checkValues();
    };

    const handleChangeAmmount = (e) => {
       setAmmount(e.target.value)
       //checkValues();
    }

    const handleChangePayments = (e) => {
        setPaymentMethod(e.value);
       // checkValues();
    }

    /*const checkValues = () => {
        if((ammount !== null) && (selectedCourse !== '') && (selectedStudent !== '') && (paymentMethod !== '') && (fileId !== '')){
            setDisabled(false);
            console.log(disabled)
        } else {
            setDisabled(true);
            console.log(disabled)
        }
    }*/

    const informPayment = async () => {
        const data = {
            courseId: selectedCourse,
            paymentType: paymentMethod,
            fileId: fileId,
            paymentValue: ammount,
            studentId: selectedStudent
        }  
        await paymentsService.informPayment(data);
    }

    useEffect(() => {
        const getStudents = async () => {
            const studentsList = await studentsService.getStudents();
            studentsList.forEach(student => {
                student.label = student.name;
                student.value = student.id;
            })
            setStudents(studentsList);
        }
        const getCourses = async () => {
            const coursesList = await coursesService.getCourses();
            coursesList.forEach(course => {
                course.label = course.title;
                course.value = course.id;
            })
            setCourses(coursesList);
        }
        getStudents();
        getCourses();
      }, [])

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-12 text-yellow-900">Pagos</h1>
                <div className="grid grid-cols-2 gap-10">
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <span className="text-gray-700 text-lg mt-6">Seleccione la persona que realizó el pago</span>
                        <div className="mt-4"><Select onChange={handleChangeStudent} options={students} /></div>
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <span className="text-gray-700 text-lg mt-6">Seleccione el curso que fue abonado</span>
                        <div className="mt-4"><Select onChange={handleChangeCourse} options={courses} /></div>
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <CommonInput 
                            label="Importe"
                            name="title"
                            className="block text-lg text-gray-700 mb-4"
                            type="number" 
                            placeholder="Importe" 
                            onChange={handleChangeAmmount}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <span className="text-gray-700 text-lg mt-6">Origen del pago</span>
                        <div className="mt-4"><Select onChange={handleChangePayments} options={paymentOptions} /></div>
                    </div>
                </div>
               {!haveFile ? (<><span className="text-gray-700 text-lg mt-6">Seleccionar comprobante para respaldar una operación</span><label for="fileUpload" className="mt-6 bg-yellow-900 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Seleccionar archivo</label>
                <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input></>) :
                (<><span className="text-gray-700 text-lg mt-6">Nombre del archivo: {fileName}</span><div className="flex flex-rox gap-4"><button onClick={() => uploadFile(file, 'Alfonso')} className="mt-6 bg-yellow-900 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Subir archivo</button><button onClick={() => deleteSelection()} className="mt-6 bg-yellow-900 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115">Eliminar selección</button></div></>)}
                <div className="grid justify-items-center"><button onClick={informPayment} className={`mt-6 bg-${disabled ? 'yellow-900' : 'gray-200'} w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550`}>Informar pago</button></div>
              </div>
            </div>
        </>
    );
} 