import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { Context } from "../../../context/Context";
import Select from "../../select/select";
import Label from "../../label/label";

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
        <Label htmlFor="category">Rubro</Label>
        <div className="flex">
            <Select
                name="category"
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