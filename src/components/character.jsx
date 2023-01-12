import React, { useEffect, useState } from "react";
import Icon from '@mdi/react'
import { mdiStarOutline, mdiStar } from '@mdi/js';
import EditModal from "./editModal";

export default function Character(props) {

const [character, setCharacter] = useState({});
const [edit, setEdit] = useState(false);
const [fav, setFav] = useState(false);
const [isSaved, setIsSaved] = useState(false);
const [name, setName] = useState(props.character.name);
const [films, setFilms] = useState(props.character.films.length);
const [height, setHeight] = useState(props.character.height);
const [mass, setMass] = useState(props.character.mass);
const index = props.index;
//let cannotBackToList = !isSaved && edit;

const setAsFav = (char) => {
  setFav(true);
  char.fav = true;
  characterModified();
};

const onChangeName = (event) => {
  setName(event.target.value)
  props.character.name = name;
  characterModified();
}

const onChangeHeight = (event) => {
  setHeight(event.target.value)
  props.character.height = height;
  characterModified();
}

const onChangeMass = (event) => {
  setMass(event.target.value);
  props.character.mass = mass;
  characterModified();
}

const setAsNotFav = (char) => {
  setFav(false);
  char.fav = false;
  characterModified();
};

const editCharacter = () => {
  setEdit(false);
  setIsSaved(true);
};

useEffect(() => {
  if(props.character.fav === true) {
    setFav(true);
  }
  characterModified();
}, [props.character.fav]);

const characterModified = () => {
  setCharacter(props.character)
  const listModified = JSON.parse(localStorage.getItem('starWarsCharacters'));
  listModified[index] = props.character;
  localStorage.setItem('starWarsCharacters', JSON.stringify(listModified));
};


    return( 
            <div className="bg-black h-full grid place-items-center text-white mt-8 md:mt-12">
              <div className="grid" >
                <div className="text-3xl my-1 flex font-semibold"><input className="bg-black" disabled={!edit} value={name}  onChange={onChangeName}/>{fav ? <button className="my-auto" type="button" onClick={() => setAsNotFav(props.character)}><Icon path={mdiStar} size={1.5} color="orange" /></button> : <button className="my-auto" type="button" onClick={() => setAsFav(props.character)}><Icon path={mdiStarOutline} size={1.5} color="orange" /></button>}</div>
                <input className={edit ? "bg-black text-xl capitalize my-1 border-b-2 border-white" : "bg-black text-xl capitalize my-1"} disabled={!edit} value={props.character.gender}/>
                <div className="flex items-strech text-xl"><span className="text-white capitalize self-center mr-1 pl-0">Birth date: </span><input className={edit ? "bg-black text-xl capitalize my-1 border-b-2 border-white" : "bg-black text-xl capitalize my-1"} disabled={!edit} value={props.character.birth_year}/></div>
                <div className="flex items-strech text-xl"><span className="text-white capitalize self-center mr-1 pl-0">Amount of films: </span><input className={edit ? "bg-black text-xl capitalize my-1 border-b-2 border-white" : "bg-black text-xl capitalize my-1"} disabled={!edit} value={films} /></div>
                <div className="flex items-strech text-xl"><span className="text-white capitalize self-center mr-1 pl-0">Height: </span><input className={edit ? "bg-black text-xl capitalize my-1 border-b-2 border-white pl-0 w-14" : "w-14 bg-black text-xl capitalize my-1 pl-0"} disabled={!edit} value={height} onChange={onChangeHeight}/><span className="text-white capitalize self-center mr-1"> | Mass: </span><input className={edit ? "bg-black text-xl capitalize my-1 border-b-2 border-white" : "bg-black text-xl capitalize my-1"} disabled={!edit} value={mass} onChange={onChangeMass}/></div>
                {!edit ? <button type="button" className="rounded-3xl mt-8 border-solid border-2 border-white py-2 px-8 text-white" onClick={() => setEdit(true)}>Editar</button>
              : <button className="rounded-3xl mt-8 border-solid border-2 border-white py-2 px-4 text-white" onClick={() => editCharacter()}>Guardar cambios</button>}
               <EditModal displayModal={false} />
              </div>
            </div>    
    );
} 