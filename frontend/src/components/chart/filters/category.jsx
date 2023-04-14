import React, { useEffect, useState } from "react";
import Select from "react-select";
import { useContext } from "react";
import { Context } from "../../../context/Context";

export default function FilterPaymentCategory({ onChange }) {

    const { categories } = useContext(Context);
    const [selectedCategory, setSelectedCategory] = useState(null);
    
    useEffect(() => {
        if (selectedCategory !== null)
            onChange(`item.categoryId eq ${selectedCategory.id}`);
    }, [selectedCategory]);
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Categoria</span>
        <div className="flex">
            <Select className="payment-filter-width" options={categories} value={selectedCategory} onChange={setSelectedCategory}/>
        </div>
    </div>
    );
} 