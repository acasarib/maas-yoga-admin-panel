import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";

export default function FilterPaymentCategory({ onChange }) {

    const { getCategories } = useContext(Context);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categories, setCategories] = useState([])
    
    useEffect(() => {
        if (selectedCategory !== null)
            onChange(`item.categoryId eq ${selectedCategory.id}`);
    }, [selectedCategory]);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = await getCategories()
            setCategories(data)
        }
        fetchCategories()
    }, [])
    
    


    return (
    <div>
        <span className="block text-gray-700 text-sm font-bold mb-2">Categoria</span>
        <div className="flex">
            <Select
                className="payment-filter-width"
                options={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
                getOptionLabel={(category)=> category.title}
                getOptionValue={(category)=> category.id}
            />
        </div>
    </div>
    );
} 