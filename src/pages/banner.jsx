import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Banner() {   
    const [hideBanner, setHideBanner] = useState(false);
    
    return(
        <>
            <div className="bg-gradient-to-b from-yellow-300 to-white h-screen grid content-center flex justify-center">
                {!hideBanner ? <><div>
                    <button className="transition duration-200 ease-in-out bg-none hover:bg-none transform hover:-translate-y-1 hover:scale-125" onClick={() => setHideBanner(true)}>
                        <img
                            src="\assets\images\maas_3colores.png"
                            width={594}
                            height={200}
                            alt="Maas Yoga logo"
                        />
                    </button>
                </div></> : <><div class="scale-up-center w-80 h-auto">
                <form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                    <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                        Usuario
                    </label>
                    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Usuario" />
                    </div>
                    <div class="mb-6">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Contraseña
                    </label>
                    <input class="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************" />
                    <p class="text-red-500 text-xs italic">Por favor, ingrese su contraseña.</p>
                    </div>
                    <div class="flex items-center justify-between">
                    <button class="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button">
                        Sign In
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