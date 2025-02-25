import React, { useContext, useState } from 'react'
import useModal from '../hooks/useModal';
import AddIcon from '@mui/icons-material/Add';
import { orange } from '@mui/material/colors';
import useToggle from '../hooks/useToggle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { formatPaymentValue } from '../utils';
import { Context } from '../context/Context';
import Modal from './modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { PAYMENT_OPTIONS } from '../constants';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SelectItem from './select/selectItem';
import CommonInput from './commonInput';
import Select from './select/select';


const ServicesCard = () => {
  const { getServices, deleteService, changeAlertStatusAndMessage, editService, newService } = useContext(Context)
  const addServiceModal = useModal();
  const deleteServiceModal = useModal();
  const isListExpanded = useToggle()
  const isEditingService = useToggle()
  const [services, setServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [serviceNote, setServiceNote] = useState('');
  const [ammount, setAmmount] = useState(null);
  const [dayOfMonth, setDayOfMonth] = useState(1); 
  

  const toggleExpandList = async () => {
    isListExpanded.toggle()
    const data = await getServices()
    setServices(data)
  }

  const handleEditService = async (srv) => {
    const method = PAYMENT_OPTIONS.filter(type => type.value == srv.type);
    setPaymentMethod(method[0]);
    if (srv.item) {
      srv.item.label = srv.item.title
      srv.item.value = srv.item.id
    }
    setSelectedItem(srv.item);
    setDayOfMonth(srv.dayOfMonth)
    addServiceModal.open();      
    isEditingService.enable()
    setSelectedService(srv)
    setServiceNote(srv.note ? srv.note : '');
    setAmmount(srv.value ? srv.value : null);
  }

  const handleDeleteService = async () => {
    try{
        await deleteService(selectedService.id);
        deleteServiceModal.close();
        const data = await getServices()
        setServices(data)
    }catch {
        changeAlertStatusAndMessage(true, 'error', 'El servicio no pudo ser eliminado... Por favor inténtelo nuevamente.');
        deleteServiceModal.close();
    }
  }

  const addService = async () => {
    try{
        const body = {
            note: serviceNote,
            value: ammount,
            type: paymentMethod.value ? paymentMethod.value : paymentMethod,
            itemId: selectedItem.id,
            dayOfMonth: dayOfMonth
        }
        if (isEditingService.value) {
            await editService(body, selectedService.id);
        } else {
            await newService(body);
        }
        const data = await getServices()
        setServices(data)
        addServiceModal.close();
    }catch {
        changeAlertStatusAndMessage(true, 'error', `El servicio no pudo ser ${isEditingService.value ? 'editado' : 'creado'}... Por favor inténtelo nuevamente.`);
    }
  }

  return (<>
    <div className={`text-gray-700 rounded-2xl px-4 py-3 bg-orange-200 my-6 md:my-10 w-full md:w-3/6 md:mx-4`}>
      <div className="text-xl md:text-2xl flex justify-between items-center">
          <div className="flex items-center gap-x-2">
              <span>Servicios</span>
              <button
                  onClick={addServiceModal.open}
                  className="bg-yellow-900 w-8 h-8 rounded-full shadow-lg flex justify-center items-center text-white text-3xl transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105"
              >
                  <span className="font-bold text-sm text-yellow-900">
                      <AddIcon fontSize="medium" sx={{ color: orange[50] }} />
                  </span>
              </button>
          </div>
          <button onClick={toggleExpandList}>
            {!isListExpanded.value && <ExpandMoreIcon />}
            {isListExpanded.value && <ExpandLessIcon/>}
          </button>
      </div>
      {isListExpanded.value && (<div><hr className="bg-white my-2 h-0.5"/>
        {services.map((tmp, index) => 
            <div className="flex justify-between items-center my-2" key={index}>
                <div className="flex gap-x-2">
                    <span>{tmp.note}</span>
                    <span>{formatPaymentValue(tmp.value)}</span>
                </div>
                <div className="flex gap-x-2">
                    <button onClick={() => handleEditService(tmp)}
                        className="bg-orange-400 w-8 h-8 rounded-full shadow-lg flex justify-center items-center transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105"
                    >
                      <span className="font-bold text-sm text-yellow-900">
                        <EditIcon fontSize="medium" />
                      </span>
                    </button>
                    <button 
                      className="bg-red-400 w-8 h-8 rounded-full shadow-lg flex justify-center items-center transition duration-200 ease-in-out bg-none hover:bg-none transform hover:scale-105"
                      onClick={() => {
                        deleteServiceModal.open()
                        setSelectedService(tmp);
                        }}
                    >
                      <DeleteIcon fontSize="medium" />
                    </button>
                </div>
            </div>
        )}
      </div>)}
    </div>

    {/* modal de borrar service */}
    <Modal
      icon={<DeleteIcon />}
      open={deleteServiceModal.isOpen}
      setDisplay={deleteServiceModal.close}
      buttonText={<span>Eliminar</span>}
      onClick={handleDeleteService}
      title="Eliminar servicio"
    >
      <div className="grid gap-10 pt-6 mb-4">
          <div>{`Usted esta a punto de eliminar el servicio ${selectedService?.note}. ¿Desea continuar?`}</div>
      </div>
    </Modal>

    {/* modal de crear/editar service */}
    <Modal
      icon={<ListAltIcon />}
      open={addServiceModal.isOpen}
      setDisplay={addServiceModal.close}
      buttonText={<span>{isEditingService.value ? "Editar" : "Agregar"}</span>}
      onClick={addService}
      title={isEditingService.value ? 'Editar servicio' : 'Crear nuevo servicio'}
      >
        <div className="grid gap-10 pt-6 mb-4">
            <div className="grid gap-4 pb-3">
                <div>
                    <span className="block text-gray-700 text-sm font-bold mb-2">Seleccione el Articulo</span>
                    <div><SelectItem onChange={setSelectedItem} value={selectedItem} /></div>
                </div>
                <div>
                    <CommonInput
                        label="Referencia del servicio"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="text" 
                        placeholder="Referencia" 
                        value={serviceNote}
                        onChange={(e) => setServiceNote(e.target.value)}
                    />
                </div>
                <div>
                    <CommonInput 
                        label="Importe"
                        name="title"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="number" 
                        placeholder="Importe" 
                        value={ammount === null ? 0 : ammount}
                        onChange={(e) => setAmmount(e.target.value)}
                    />    
                </div>
                <div>
                    <CommonInput 
                        label="Día del mes"
                        name="Día del mes"
                        className="block font-bold text-sm text-gray-700 mb-2"
                        type="number" 
                        placeholder="Día del mes" 
                        value={dayOfMonth}
                        min="0"
                        onChange={(e) => setDayOfMonth(e.target.value)}
                    />
                </div>
                <div>
                    <span className="block text-gray-700 text-sm font-bold mb-2">Modo de pago</span>
                    <div>
                      <Select
                        onChange={(e) => setPaymentMethod(e.value)}
                        defaultValue={paymentMethod}
                        options={PAYMENT_OPTIONS}
                      />
                    </div>
                </div>
            </div>
        </div>
    </Modal>
  </>)
}

export default ServicesCard;