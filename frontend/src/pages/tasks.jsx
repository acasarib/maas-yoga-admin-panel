import React from "react";

export default function Tasks(props) {

    return(
        <>
            <div className="px-6 py-8 max-w-6xl mx-auto">
                <div className="bg-white rounded-3xl p-8 mb-5 mt-6 md:mt-16">
                <h1 className="text-2xl md:text-3xl text-center font-bold mb-6 text-yellow-900">Tareas pendientes</h1>
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p className="font-bold">Tareas pendientes</p>
                    <p>Tareas pendientes</p>
                </div>
              </div>
            </div>
        </>
    );
} 