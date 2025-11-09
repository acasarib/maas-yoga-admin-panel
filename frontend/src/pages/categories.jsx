import React, {useContext, useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import Modal from "../components/modal";
import CommonInput from "../components/commonInput";
import DeleteIcon from '@mui/icons-material/Delete';
import ViewSlider from 'react-view-slider'
import CloseIcon from '@mui/icons-material/Close';
import Table from "../components/table";
import { Context } from "../context/Context";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Container from "../components/container";
import PlusButton from "../components/button/plus";
import DeleteButton from "../components/button/deleteButton";
import EditButton from "../components/button/editButton";
import CategoryIcon from '@mui/icons-material/Category';
import NoDataComponent from "../components/table/noDataComponent";
import CategoryStepper from "../components/stepper/categoryStepper";
import { Tooltip } from "@mui/material";

//TODO: categorias paginadas
export default function Categories(props) {
    const { getCategories, isLoadingCategories, deleteCategory, editCategory, newCategory, changeAlertStatusAndMessage } = useContext(Context);
    const [displayModal, setDisplayModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [edit, setEdit] = useState(false);
    const [category, setCategory] = useState({ title: "" });
    const [activeView, setActiveView] = useState(0)
    const [newItem, setNewItem] = useState("");
    const [btnText, setBtnText] = useState("Siguiente");
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);

    const fetchCategories = async (force = false) => {
        const data = await getCategories(force);
        setCategories(data);
    };
    useEffect(() => {
        fetchCategories(true);
    }, [])
    

    const closeModal = () => {
        setDisplay(false);
        setCategory({ title: "" });
        setItems([]);
        setNewItem("");
        setActiveView(0);
        setEdit(false);
    }

    const addItem = () => {
        setItems(current => [...current, { title: newItem }]);
        setNewItem("");
    }

    const removeItem = (item) => setItems(current => current.filter(i => i.title !== item.title));

    const editItem = (oldValue, newValue) => setItems(current => current.map(i => {
        if (i.title === oldValue) {
            i.title = newValue
        }
        return i;
    }))

    const renderView = ({ index, active, transitionState }) => (
        <>
        {index === 0 &&
            <div className="relative col-span-2">
                <CommonInput 
                    label="Título del rubro"    
                    value={category.title}
                    name="title"
                    htmlFor="title"
                    id="title"
                    onPressEnter={handleOnClickNext}
                    type="text" 
                    placeholder="Título" 
                    onChange={(e) => setCategory({ ...category, title: e.target.value })}
                />
            </div>
        }
        {index === 1 && 
            <div>
                <div className="w-full flex justify-between items-center mb-4">
                    <div><ArrowBackIcon onClick={() => setActiveView(0)} className="cursor-pointer"/></div>
                    <div><h1 className="text-2xl md:text-3xl text-center">{category.title}</h1></div>
                    <div></div>
                </div>
                <div className="flex items-center">
                    <div className="w-full">
                        <CommonInput
                            label="Nuevo articulo"    
                            value={newItem}
                            name="newItem"
                            htmlFor="newItem"
                            id="newItem" 
                            type="text"
                            onPressEnter={addItem}
                            placeholder="Ingrese el articulo" 
                            onChange={(e) => setNewItem(e.target.value)}
                        />
                    </div>
                    <Tooltip title="Añadir">
                        <AddIcon className="mt-6 cursor-pointer" onClick={addItem}/>
                    </Tooltip>
                </div>
                <div className="mt-6">
                    {items.map((item, i) =>
                        <div key={i} className="flex items-center">
                            <div className="w-full">
                                <CommonInput
                                    value={item.title}
                                    type="text" 
                                    placeholder="Ingrese el articulo" 
                                    onChange={(e) => editItem(item.title, e.target.value)}
                                />
                            </div>
                            <Tooltip title="Quitar">
                                <CloseIcon className="mt-3 cursor-pointer" onClick={() => removeItem(item)}/>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        }</>
    )

    useEffect(() => {
        if (activeView === 0)
            setBtnText("Siguiente");
        else
            setBtnText(edit ? "Editar" : "Crear");
    }, [activeView]);

    const setDisplay = (value) => {
        setDisplayModal(value);
        setDeleteModal(value);
        setEdit(false);
    }

    const openDeleteModal = (category) => {
        setDeleteModal(true);
        setCategory(category);
    }

    const openEditModal = async (category) => {
        setCategory(category);
        setItems(category.items);
        setEdit(true);
        setDisplayModal(true);
    }

    const handleDeleteCategory = async () => {
        setIsLoading(true);
        try{
            await deleteCategory(category.id);
            setTimeout(() => {
                fetchCategories(true)
            }, 150);
        }catch {
            changeAlertStatusAndMessage(true, 'error', 'La categoria no pudo ser eliminada... Por favor inténtelo nuevamente.')
        }
        setIsLoading(false);
        setCategory({ title: "" });
        setDeleteModal(false);
    }

    const columns = [
        {
            name: 'Rubro',
            selector: row => row.title,
            sortable: true,
            searchable: true,
        },
        {
            name: 'Acciones',
            maxWidth: '20%',
            cell: row => <div className="flex flex-nowrap"><DeleteButton onClick={() => openDeleteModal(row)} /><EditButton onClick={() => openEditModal(row)}/></div>
        },
    ];

    const handleOnClickNext = async () => {
        if (activeView === 0) {
            setActiveView(1);
        } else {
            try{
                const c = { ...category, items };
                if (edit) {
                    await editCategory(c.id, c);
                    setTimeout(() => {
                        fetchCategories(true);
                    }, 150);
                } else {
                    await newCategory(c);
                    setTimeout(() => {
                        fetchCategories(true);
                    }, 150);
                }
                setCategory({ title: "" });
                setItems([]);
                setNewItem("");
                setActiveView(0);
                setEdit(false);
            }catch {
                changeAlertStatusAndMessage(true, 'error', 'La categoria no pudo ser informada... Por favor inténtelo nuevamente.')
            }
            closeModal();
        }
        
    }

    return(
        <>
            <Container title="Rubros">
                <Table
                    columns={columns}
                    data={categories}
                    progressPending={isLoadingCategories}
                    pagination paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                    responsive
                    noDataComponent={<NoDataComponent Icon={CategoryIcon} title="No hay rubros" subtitle="No se encontraron rubros" />}
                />
                <div className="flex justify-end mt-6">
                    <PlusButton onClick={() => setDisplayModal(true)}/>
                </div>
                <Modal onClose={closeModal} icon={<HistoryEduIcon />} open={displayModal} setDisplay={setDisplay} title={edit ? 'Editar rubro' : 'Agregar rubro'} buttonDisabled={activeView === 0 ? category.title === "" : (items.length === 0 || category.title === "")} buttonText={<span>{btnText}</span>} onClick={handleOnClickNext} children={<>
                    <div style={{ minHeight: "210px"}} className="flex gap-6 flex-col">
                        <div className="flex-shrink-0">
                            <CategoryStepper activeStep={activeView} onStepChange={setActiveView} />
                        </div>
                        <div className="flex-1">
                            <ViewSlider
                                renderView={renderView}
                                numViews={2}
                                activeView={activeView}
                                animateHeight
                            />
                        </div>
                    </div>
                </>} />
                <Modal danger onClose={() => setCategory({ title: "" })} icon={<DeleteIcon />} open={deleteModal} setDisplay={setDisplay} title="Eliminar rubro" buttonText={isLoading ? (<><i className="fa fa-circle-o-notch fa-spin"></i><span className="ml-2">Eliminando...</span></>) : <span>Eliminar</span>} onClick={handleDeleteCategory} children={<><div>Esta a punto de eliminar el rubro <span className="font-bold">{category.title}</span>, el rubro no debe estar asociado a ningun pago. ¿Desea continuar?</div></>} />
            </Container>
        </>
    );
} 