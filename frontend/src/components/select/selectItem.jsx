import React, { useContext } from "react";
import { Context } from "../../context/Context";
import Select, { components } from 'react-select';

export default function SelectItem({ className, onChange, value }) {

    const { items } = useContext(Context);

    const CustomItemOption = (props) => {
        const { children, ...rest } = props;
        return <components.Option ref={props.innerRef} {...rest}><div className="flex w-full"><span className="w-full">{props.data.title}</span><span className="font-bold">{props.data.categoryTitle}</span></div></components.Option>
    }

    return(
        <Select className={className} components={{ Option: CustomItemOption }} onChange={onChange} value={value} options={items} />
    );
} 