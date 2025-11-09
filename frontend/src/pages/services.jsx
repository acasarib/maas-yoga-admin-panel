import React, { useContext, useEffect, useState } from "react";
import Container from "../components/container";
import Table from "../components/table";
import PlusButton from "../components/button/plus";
import Modal from "../components/modal";
import useModal from "../hooks/useModal";
import useToggle from "../hooks/useToggle";
import { Context } from "../context/Context";
import { formatPaymentValue } from "../utils";
import { PAYMENT_OPTIONS } from "../constants";
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import CommonInput from "../components/commonInput";
import Select from "../components/select/select";
import SelectItem from "../components/select/selectItem";
import EditButton from "../components/button/editButton";
import DeleteButton from "../components/button/deleteButton";
import NoDataComponent from "../components/table/noDataComponent";
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import Label from "../components/label/label";

export default function Services(props) {
    const { getServices, deleteService, changeAlertStatusAndMessage, editService, newService } = useContext(Context);
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const addServiceModal = useModal();
    const deleteServiceModal = useModal();
    const isEditingService = useToggle();
    const [selectedService, setSelectedService] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [serviceNote, setServiceNote] = useState('');
    const [ammount, setAmmount] = useState(null);
    const [dayOfMonth, setDayOfMonth] = useState(1);

    useEffect(() => {
        loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadServices = async (force = false) => {
        setIsLoading(true);
        try {
            const data = await getServices(force);
            setServices(data);
        } catch (error) {
            changeAlertStatusAndMessage(true, 'error', 'Error al cargar servicios');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditService = (srv) => {
        console.log('=== DEBUG handleEditService ===');
        console.log('srv:', srv);
        console.log('srv.item:', srv.item);
        
        const method = PAYMENT_OPTIONS.filter(type => type.value === srv.type);
        setPaymentMethod(method[0]);
        setSelectedItem(srv.item);
        setDayOfMonth(srv.dayOfMonth);
        setSelectedService(srv);
        setServiceNote(srv.note ? srv.note : '');
        setAmmount(srv.value ? srv.value : null);
        isEditingService.enable();
        addServiceModal.open();
    };

    const handleAddService = () => {
        setPaymentMethod(null);
        setSelectedItem(null);
        setServiceNote('');
        setAmmount(null);
        setDayOfMonth(1);
        setSelectedService(null);
        isEditingService.disable();
        addServiceModal.open();
    };

    const handleDeleteService = async () => {
        try {
            await deleteService(selectedService.id);
            deleteServiceModal.close();
            await loadServices(true);
            changeAlertStatusAndMessage(true, 'success', 'Servicio eliminado correctamente');
        } catch {
            changeAlertStatusAndMessage(true, 'error', 'El servicio no pudo ser eliminado');
            deleteServiceModal.close();
        }
    };

    const addService = async () => {
        console.log('=== DEBUG addService ===');
        console.log('serviceNote:', serviceNote);
        console.log('ammount:', ammount);
        console.log('paymentMethod:', paymentMethod);
        console.log('selectedItem:', selectedItem);
        console.log('dayOfMonth:', dayOfMonth);
        
        // Validaciones básicas
        if (!serviceNote.trim()) {
            changeAlertStatusAndMessage(true, 'error', 'La descripción del servicio es requerida');
            return;
        }
        if (!ammount || ammount <= 0) {
            changeAlertStatusAndMessage(true, 'error', 'El valor debe ser mayor a 0');
            return;
        }
        if (!paymentMethod) {
            changeAlertStatusAndMessage(true, 'error', 'Debe seleccionar un método de pago');
            return;
        }
        if (!selectedItem || !selectedItem.id) {
            console.log('selectedItem es null, undefined o sin id:', selectedItem);
            changeAlertStatusAndMessage(true, 'error', 'Debe seleccionar un artículo');
            return;
        }

        try {
            const body = {
                note: serviceNote,
                value: parseFloat(ammount),
                type: paymentMethod?.value || paymentMethod,
                itemId: selectedItem?.id,
                dayOfMonth: parseInt(dayOfMonth)
            };
            console.log('Enviando servicio:', body);
            console.log('Método de pago seleccionado:', paymentMethod);
            if (isEditingService.value) {
                await editService(body, selectedService.id);
            } else {
                await newService(body);
            }
            await loadServices(true);
            addServiceModal.close();
            changeAlertStatusAndMessage(true, 'success', `Servicio ${isEditingService.value ? 'editado' : 'creado'} correctamente`);
        } catch (error) {
            console.error('Error al guardar servicio:', error);
            changeAlertStatusAndMessage(true, 'error', `El servicio no pudo ser ${isEditingService.value ? 'editado' : 'creado'}`);
        }
    };

    const columns = [
        {
            name: "Descripción",
            selector: row => row.note,
            sortable: true,
            searchable: true
        },
        {
            name: "Valor",
            selector: row => formatPaymentValue(row.value),
            sortable: true
        },
        {
            name: "Tipo",
            selector: row => {
                const method = PAYMENT_OPTIONS.find(type => type.value === row.type);
                return method ? method.label : row.type;
            },
            sortable: true
        },
        {
            name: "Día del mes",
            selector: row => row.dayOfMonth,
            sortable: true
        },
        {
            name: "Artículo",
            selector: row => row.item ? row.item.title : '-',
            sortable: true
        },
        {
            name: "Acciones",
            cell: row => (
                <div className="flex gap-2">
                    <EditButton onClick={() => handleEditService(row)} />
                    <DeleteButton onClick={() => {
                        setSelectedService(row);
                        deleteServiceModal.open();
                    }} />
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        }
    ];

    return (
        <Container title="Servicios">
            <Table
                columns={columns}
                data={services}
                progressPending={isLoading}
                noDataComponent={<NoDataComponent Icon={MiscellaneousServicesIcon} title="No hay servicios" subtitle="No se encontraron servicios disponibles" />}
                pagination
                paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
            />
            <div className="flex justify-end mt-6">
                <PlusButton onClick={handleAddService} />
            </div>

            {/* Modal de eliminar servicio */}
            <Modal
                danger
                icon={<DeleteIcon />}
                open={deleteServiceModal.isOpen}
                setDisplay={deleteServiceModal.close}
                buttonText={<span>Eliminar</span>}
                onClick={handleDeleteService}
                title="Eliminar servicio"
            >
                <div>{`¿Está seguro que desea eliminar el servicio "${selectedService?.note}"?`}</div>
            </Modal>

            {/* Modal de crear/editar servicio */}
            <Modal
                icon={<ListAltIcon />}
                open={addServiceModal.isOpen}
                setDisplay={addServiceModal.close}
                buttonText={<span>{isEditingService.value ? "Editar" : "Agregar"}</span>}
                onClick={addService}
                title={isEditingService.value ? 'Editar servicio' : 'Crear nuevo servicio'}
            >
                <form className="grid gap-6">
                    <div>
                        <Label htmlFor="item">Artículo</Label>
                        <SelectItem
                            name="item"
                            value={selectedItem} 
                            onChange={setSelectedItem} 
                        />
                    </div>
                    <div>
                        <Label htmlFor="paymentType">Método de pago</Label>
                        <Select
                            name="paymentType"
                            value={paymentMethod} 
                            onChange={setPaymentMethod} 
                            options={PAYMENT_OPTIONS} 
                            placeholder="Seleccionar método de pago"
                        />
                    </div>
                    <div>
                        <CommonInput
                            name="description" 
                            label="Descripción del servicio" 
                            value={serviceNote} 
                            onChange={(e) => setServiceNote(e.target.value)} 
                        />
                    </div>
                    <div>
                        <CommonInput 
                            name="amount"
                            currency
                            label="Valor" 
                            type="number" 
                            value={ammount} 
                            onChange={(e) => setAmmount(e.target.value)} 
                        />
                    </div>
                    <div>
                        <CommonInput 
                            name="dayOfMonth"
                            label="Día del mes" 
                            type="number" 
                            min="1" 
                            max="31" 
                            value={dayOfMonth} 
                            onChange={(e) => setDayOfMonth(e.target.value)} 
                        />
                    </div>
                </form>
            </Modal>
        </Container>
    );
}
