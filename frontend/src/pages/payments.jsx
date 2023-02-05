import React, { useEffect, useState } from "react";
import Chart from "../components/chart";
import AddIcon from '@mui/icons-material/Add';
import paymentsService from "../services/paymentsService";

export default function Payments(props) {

    const [file, setFile] = useState([]);
    const [haveFile, setHaveFile] = (false);

    const handleFileChange = (e) => {
        if (e.target.files) {
          setFile([...file, e.target.files[0]]);
        }
    };

    const uploadFile = async (file, fileName) => {
        const response = await paymentsService.uploadFile(file, fileName);
        console.log(response);  
    }

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-12 text-yellow-900">Pagos</h1>
                <span className="text-yellow-900 text-lg mt-6">Si lo desea puede subir un comprobante para respaldar una operación</span>
               <label for="fileUpload" className="mt-6 bg-yellow-900 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115">Seleccionar archivo</label>
                <input type="file" id="fileUpload" style={{ display: 'none' }} onChange={handleFileChange}></input>
                <button onClick={() => uploadFile(file, 'Alfonso')} className="mt-6 bg-yellow-900 w-40 h-auto rounded-lg py-2 px-3 text-center shadow-lg flex justify-center items-center text-white transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-115">Subir archivo</button>
              </div>
            </div>
        </>
    );
} 