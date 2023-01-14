import React, { useEffect, useState } from "react";
import Container from "../components/container";
import { getCharacters } from "../services/charactersService";
import Icon from '@mdi/react'
import { mdiClose, mdiStar } from '@mdi/js';
import Character from "../components/character";
import DeleteModal from "../components/deleteModal";

export default function Home() {

const [list, setList] = useState([]);
const [showCharacter, setShowCharacter] = useState(false);
const [charToShow, setCharToShow] = useState({});
const [displayModal, setDisplayModal] = useState(false);
const [charIndex, setCharIndex] = useState(null);
const [favList, setFavList] = useState([]);
const [viewFavList, setViewFavList] = useState(false);

const getListOfCharacters = async () => {
    if(!localStorage.getItem('starWarsCharacters')) {
        await getCharacters();
        const newList = localStorage.getItem('starWarsCharacters');
        setList(JSON.parse(newList));
    }else {
        const characters = JSON.parse(localStorage.getItem('starWarsCharacters'));
        setList(characters);
    }
}

const viewCharacter = (character, index, show) => {
    getIndex(index, show)
    setShowCharacter(true);
    setCharToShow(character);
}

const deleteChar = (index) => {
    list.splice(index, 1)
    localStorage.setItem('starWarsCharacters', JSON.stringify(list));
    setDisplayModal(false);
}

const getIndex = (index, show) => {
    setCharIndex(index);
    setDisplayModal(show)
}

const viewFavs = () => {
    const favList = list.filter((char) => char.fav === true);
    setViewFavList(true);
    setFavList(favList);
};

useEffect(() => {
  getListOfCharacters();
}, []);


    return(
            <div className="bg-black h-screen px-auto">
                <Container className="pt-14 bg-black">
                    <h1 className="text-white text-4xl">Star Wars characters</h1>
        
                        {!showCharacter ? 
                            <div className="grid place-items-center">
                                {!viewFavList ? <button onClick={() => viewFavs()} className="hover:text-gray-400 hover:border-gray-400 rounded-3xl mt-8 border-solid border-2 border-white py-2 px-4 text-white">Filtrar por favoritos</button>
                                : <button onClick={() => setViewFavList(false)} className="text-gray-800 rounded-3xl mt-8  bg-white py-2 px-4 text-white">Filtrar por favoritos</button>}
                                <div className="text-white grid grid-cols-2 mt-8">
                                    {!viewFavList ?
                                        list.map((char, index) => {
                                            return (
                                                <div key={index} className="grid col-span-2 md:col-span-1 grid-cols-8 my-3 mx-4">
                                                    <div className="my-auto col-span-1 text-white"><button onClick={() => getIndex(index, true)}>
                                                    <Icon path={mdiClose}
                                                            size={1}
                                                            color="grey"
                                                            /></button></div>
                                                    <button onClick={() => viewCharacter(char, index)} className="hover:text-gray-400 col-span-7 text-left">
                                                        <span className="flex inline-flex">{char.name}{char.fav && (<span className="ml-2 my-auto"><Icon path={mdiStar} size={0.5} color="orange" /></span>)}</span><br/>
                                                        <span className="capitalize">{char.gender} </span> | Birth date: {char.birth_year}
                                                    </button>
                                                </div>
                                            )
                                        })
                                    :  favList.map((char, index) => {
                                        return (
                                            <div key={index} className="grid col-span-2 md:col-span-1 grid-cols-8 my-3 mx-4">
                                                <div className="my-auto col-span-1 text-white"><button onClick={() => getIndex(index, true)}>
                                                <Icon path={mdiClose}
                                                        size={1}
                                                        color="grey"
                                                        /></button></div>
                                                <button onClick={() => viewCharacter(char, index, false)} className="hover:text-gray-400 col-span-7 text-left">
                                                    <span className="flex inline-flex">{char.name}{char.fav && (<span className="ml-2 my-auto"><Icon path={mdiStar} size={0.5} color="orange" /></span>)}</span><br/>
                                                    <span className="capitalize">{char.gender} </span> | Birth date: {char.birth_year}
                                                </button>
                                            </div>
                                        )
                                    }) }
                                </div>
                            </div> 
                        : <><button onClick={() => setShowCharacter(false)} className="text-left text-white my-4 hover:text-gray-400">&#60;  Volver al listado</button><Character character={charToShow} index={charIndex}/></>}
                    <DeleteModal displayModal={displayModal} deleteChar={() => deleteChar(charIndex)} onClick={() =>  setDisplayModal(false)}/>
                </Container> 
            </div>    
    );
} 