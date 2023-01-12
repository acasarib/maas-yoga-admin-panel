import React from "react";

export default function EditModal(props) {
    return (
        <>
            {props.displayModal && (
                <div class="bg-slate-800 bg-opacity-50 flex justify-center items-center absolute top-0 right-0 bottom-0 left-0">
                    <div class="bg-white px-16 py-8 rounded-md text-center">
                    <h1 class="text-xl mb-4 font-bold text-gray-800">Tienes cambios sin guardar</h1>
                    <button className="mx-2 text-gray-800 border-gray-800 rounded-3xl mt-8 border-solid border-2  py-2 px-4  hover:border-gray-400 hover:text-gray-400" onClick={props.onClick}>cancelar</button>
                    <button className="mx-2 hover:text-gray-400 rounded-3xl mt-8 border-solid border-2 bg-gray-800 py-2 px-4 text-white" type="submit" onClick={props.deleteChar}>abandonar página</button>
                    </div>
                </div>
            )}
        </>
        
    );
  }
  