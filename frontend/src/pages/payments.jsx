import React, { useEffect, useState } from "react";
import paymentsService from "../services/paymentsService";
import Select from 'react-select';
import CommonInput from "../components/commonInput";
import Modal from "../components/modal";
import PaidIcon from '@mui/icons-material/Paid';
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import DataTable from 'react-data-table-component';

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
    const [isLoading, setIsLoading] = useState(false);
    const [opResult, setOpResult] = useState('Verificando pagos...');
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [payments, setPayments] = useState([]);
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

    const uploadFile = async (file) => {
        setIsLoading(true);
        const response = await paymentsService.uploadFile(file);
        setFileId(response.id);
        setFile([]);
        setHaveFile(false);
        //checkValues();
        setFilename("");
        setIsLoading(true);
    }

    const setDisplay = (value) => {
        setOpenModal(value);
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

    const columns = [
        {
            name: 'Proveniente de',
            selector: row => row.type,
            sortable: true,
        },
        {
            name: 'Importe',
            cell: row => <span className="w-16">{'$' + row.value}</span>,
            sortable: true,
            //maxWidth: '80px'
        },
        {
            name: 'Abonado por',
            selector: row => row.student.name + ' ' + row.student.lastName,
            sortable: true,
        },
        {
            name: 'Informado por',
            selector: row => row.user.firstName + ' ' + row.user.lastName,
            sortable: true,
        },
        {
            name: 'Fecha',
            selector: row => {var dt = new Date(row.createdAt);
                let year  = dt.getFullYear();
                let month = (dt.getMonth() + 1).toString().padStart(2, "0");
                let day   = dt.getDate().toString().padStart(2, "0");
                var date = day + '/' + month + '/' + year; return date},
            sortable: true,
            maxWidth: '80px'
        },
        {
            name: 'Comprobante',
            cell: row => {return (<><a href={`https://maas-yoga-admin-panel.onrender.com/api/v1/files/${row.fileId}`} className="bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center text-white hover:bg-orange-550 whitespace-nowrap">Obtener comprobante
            </a></>)},
            sortable: true,
        },
    ];

    const informPayment = async () => {
        setIsLoadingPayment(true);
        const data = {
            courseId: selectedCourse,
            paymentType: paymentMethod,
            fileId: fileId,
            paymentValue: ammount,
            studentId: selectedStudent
        }  
        try{
            await paymentsService.informPayment(data);
            const response= await paymentsService.getAllPayments();
            setPayments(response);
            setIsLoadingPayment(false);
            setOpenModal(false);
        }catch(err) {
            console.log(err);
        }
        setAmmount(null);
        setPaymentMethod('');
        setFileId('');
        setSelectedCourse('');
        setSelectedStudent('');
        setOpenModal(false);
        
    }

    useEffect(() => {
        setStudents(props.students);
        setCourses(props.courses);
        const getPayments = async () => {
           const response= await paymentsService.getAllPayments();
           setPayments(response);
        }
        getPayments();
        if(payments.length === 0) {
            setOpResult('No fue posible obtener los pagos, por favor recargue la página...')
        }
      }, [props.students, props.courses]);

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-12 text-yellow-900">Pagos</h1>
                <div className="my-6 md:my-12 mx-8 md:mx-4">
                    <DataTable
                        columns={columns}
                        data={payments}
                        pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    />
                </div>
                <Modal icon={<PaidIcon />} open={openModal} setDisplay={setDisplay} buttonText={isLoadingPayment ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Informando...</span></>) : <span>Informar pago</span>} onClick={informPayment} title="Informar pago" children={<>
                <div className="grid grid-cols-2 gap-10 pr-8 pt-6 mb-4">
                    <div className="col-span-2 md:col-span-1">
                        <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione la persona que realizó el pago</span>
                        <div className="mt-4"><Select onChange={handleChangeStudent} options={students} /></div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione el curso que fue abonado</span>
                        <div className="mt-4"><Select onChange={handleChangeCourse} options={courses} /></div>
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <CommonInput 
                            label="Importe"
                            name="title"
                            className="block font-bold text-sm text-gray-700 mb-4"
                            type="number" 
                            placeholder="Importe" 
                            onChange={handleChangeAmmount}
                        />
                    </div>
                    <div className="col-span-2 md:col-span-1 pb-6">
                        <span className="block text-gray-700 text-sm font-bold mb-2">Origen del pago</span>
                        <div className="mt-4"><Select onChange={handleChangePayments} options={paymentOptions} /></div>
                    </div>
                </div>
                {!haveFile ? (<><span className="block text-gray-700 text-sm font-bold mb-2">Seleccionar comprobante para respaldar una operación</span><label for="fileUpload" className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Seleccionar archivo</label>
                <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input></>) :
                (<><span className="block text-gray-700 text-sm font-bold mb-2">Nombre del archivo: {fileName}</span><div className="flex flex-rox gap-4"><button onClick={() => uploadFile(file)} className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">{isLoading ? (<><i className="fa fa-circle-o-notch fa-spin mr-2"></i><span>Subiendo...</span></>) : <span>Subir archivo</span>}</button><button onClick={() => deleteSelection()} className="mt-6 bg-orange-300 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white hover:bg-orange-550">Eliminar selección</button></div></>)}
                </>} />
                <div className="flex justify-end">
                    <button onClick={() => setOpenModal(true)}
                        className="mt-6 bg-yellow-900 w-14 h-14 rounded-full shadow-lg flex justify-center items-center text-white text-4xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115"><span className="font-bold text-sm text-yellow-900"><AddIcon fontSize="large" sx={{ color: orange[50] }} /></span>
                    </button>
                </div>
              </div>
            </div>
        </>
    );
} 