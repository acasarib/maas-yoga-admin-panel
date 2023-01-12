import React from "react";

export default function DeleteModal(props) {
    return (
        <>
            {props.displayModal && (
                <div class="bg-slate-800 bg-opacity-50 flex justify-center items-center absolute top-0 right-0 bottom-0 left-0">
                    <div class="bg-white px-8 py-8 rounded-md text-center">
                    <h1 class="text-xl mb-2  font-bold text-gray-800">Seguro que quieres borrar?</h1>
                    <div className="text-gray-800">Si borras, la acción no se podrá deshacer</div>
                    <button className="mx-2 text-gray-800 border-gray-800 rounded-3xl mt-4 border-solid border-2  py-1 px-4 w-28 hover:border-gray-400 hover:text-gray-400" onClick={props.onClick}>cancelar</button>
                    <button className="mx-2 hover:text-gray-400 border-gray-800 rounded-3xl mt-4 border-solid border-2 bg-gray-800 py-1 px-4 w-28 text-white" onClick={props.deleteChar}>borrar</button>
                    </div>
                </div>
            )}
        </>
        
    );
  }
  