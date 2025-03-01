import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import Select from "./select";

export default function SelectProfessors(props) {
    const { getProfessors } = useContext(Context)
    const [professors, setProfessors] = useState([]);

    const fetchProfessors = async () => {
        const professors = await getProfessors();
        setProfessors(professors);
    }
    
    useEffect(() => {
      fetchProfessors();
    }, [])

    return(
      <Select
        options={professors}
        getOptionLabel = {(professor)=> professor.name + " " + professor.lastName}
        getOptionValue = {(professor)=> professor.id}
        {...props}
      />
    );
} 