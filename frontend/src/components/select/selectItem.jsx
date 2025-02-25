import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/Context";
import Select from "./select";
import { components } from 'react-select';

export default function SelectItem({ className, onChange, value }) {

    const { getItems } = useContext(Context);

    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        const data = await getItems()
        setItems(data)
    }

    useEffect(() => {
        fetchItems()
    }, [])
    

    const CustomItemOption = (props) => {
        const { children, ...rest } = props;
        return <components.Option ref={props.innerRef} {...rest}><div className="flex w-full"><span className="w-full">{props.data.title}</span><span className="font-bold">{props.data.category.title}</span></div></components.Option>
    }

    return(
        <Select
            className={className}
            components={{ Option: CustomItemOption }}
            onChange={onChange}
            value={value}
            options={items}
            getOptionLabel={(item) => item.title}
            getValueLabel={(item) => item.id}
        />
    );
} 