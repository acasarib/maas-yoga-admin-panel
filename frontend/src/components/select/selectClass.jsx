import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import Select from "./select";

export default function SelectClass(props) {
    const { getClazzes } = useContext(Context)
    const [clazzes, setClazzes] = useState([]);

    const fetchClazzes = async () => {
        const clazzes = await getClazzes();
        setClazzes(clazzes);
    }
    
    useEffect(() => {
        fetchClazzes();
    }, [])

    return(
      <Select
        options={clazzes.filter(clazz => !clazz.paymentsVerified)}
        getOptionLabel ={(clazz)=> clazz.title}
        getOptionValue ={(clazz)=> clazz.id}
        {...props}
      />
    );
} 