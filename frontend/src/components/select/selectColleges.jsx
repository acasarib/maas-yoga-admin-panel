import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import Select from "./select";

export default function SelectColleges(props) {
    const { getColleges } = useContext(Context)
    const [colleges, setColleges] = useState([]);

    const fetchColleges = async () => {
        const colleges = await getColleges();
        setColleges(colleges);
    }
    
    useEffect(() => {
      fetchColleges();
    }, [])

    return(
      <Select
        options={colleges}
        getOptionLabel = {(college)=> college.name}
        getOptionValue = {(college)=> college.id}
        {...props}
      />
    );
} 