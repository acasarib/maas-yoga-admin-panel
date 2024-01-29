import React, { useContext, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PaidIcon from '@mui/icons-material/Paid';
import { dateToYYYYMMDD, formatDateDDMMYY, isByAssistance, isByPercentage, toMonthsNames } from "../../../utils";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import List from '@mui/material/List';
import SchoolIcon from '@mui/icons-material/School';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Collapse from '@mui/material/Collapse';
import ListItem from '@mui/material/ListItem';
import HailIcon from '@mui/icons-material/Hail';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PercentIcon from '@mui/icons-material/Percent';
import ListItemText from '@mui/material/ListItemText';
import ButtonPrimary from "../../button/primary";
import { Context } from "../../../context/Context";
import { CASH_PAYMENT_TYPE } from "../../../constants";
import AddProfessorPaymentModal from "../../modal/addProfessorPaymentModal"

export default function ProfessorDetailCollapse({ professor, onShowPayments, from, to, onInformPayment }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { informPayment } = useContext(Context);

    const toggleModal = () => setIsModalOpen(!isModalOpen)
    let criteria = isByPercentage(professor.result.period.criteria) ? `Se debe pagar el ${professor.result.period.criteriaValue}% del total de ingresos.` : `Se debe pagar ${professor.result.period.criteriaValue}$ por cada estudiante.`
    criteria = isByAssistance(professor.result.period.criteria) ? criteria + " Se debe informar la asistencia de los estudiantes al hacer click en 'informar'": criteria;
    const period = toMonthsNames(professor.result.period.startAt, professor.result.period.endAt)

    const addPayment = async (value) => {
        const parsedFrom = dateToYYYYMMDD(from.$d);
        const parsedTo = dateToYYYYMMDD(to.$d);
        const payment = {
            type: CASH_PAYMENT_TYPE,
            value: value || professor.result.collectedByProfessor * -1,
            at: new Date(),
            operativeResult: new Date(),
            periodFrom: parsedFrom,
            periodTo: parsedTo,
            verified: false,
            courseId: professor.result.courseId,
            professorId: professor.id
        }
        informPayment(payment);
        onInformPayment(payment);
    }

    const alreadyInformedPayment = () => {
        const fromTo = toMonthsNames(from, to);
        return professor.payments.some(payment => toMonthsNames(payment.periodFrom, payment.periodTo) === fromTo);
    }

    const handleInform = () => {
        if (isByAssistance(professor.result.period.criteria))
            toggleModal()
        else
            addPayment()
    }

    return (<>
    <ListItemButton sx={{ pl: 4 }} onClick={() => setIsOpen(!isOpen)}>
        <ListItemIcon>
            <HailIcon />
        </ListItemIcon>
        <ListItemText primary={`${professor.name} ${professor.lastName}`} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
    </ListItemButton>
    <Collapse className="ml-10" in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
            <ListItemButton onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                <ListItemIcon className="text-yellow-900">
                    <CalendarMonthIcon/>
                </ListItemIcon>
                <ListItemText primary="Periodo" secondary={toMonthsNames(professor.result.period.startAt, professor.result.period.endAt)} />
            </ListItemButton>
            <Collapse className="ml-10" in={isCalendarOpen} timeout="auto" unmountOnExit>
                <div className="font-bold">Periodos en que se dicta en el curso</div>
                <ul>
                    {professor.periods.map((period, i) => 
                        <li key={i}>
                            <span className={period.id === professor.result.period.id && "font-bold"}>- {toMonthsNames(period.startAt, period.endAt)} </span><span>{period.id === professor.result.period.id && "(periodo seleccionado)"}</span>
                        </li>
                    )}
                </ul>
                {professor.payments.length >= 1 && <>
                    <div className="font-bold mt-8">Periodos ya pagados</div>
                    <ul>
                        {professor.payments.filter(p => "periodFrom" in p && "periodTo" in p).map((p,i) => 
                            <li key={i}>
                                <span>- {toMonthsNames(p.periodFrom, p.periodTo)} </span>
                            </li>
                        )}
                    </ul>
                    </>
                }
            </Collapse>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <SchoolIcon/>
                </ListItemIcon>
                <ListItemText primary="Estudiantes que abonaron" secondary={professor.result.totalStudents} />
            </ListItem>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <PaidIcon/>
                </ListItemIcon>
                <ListItemText primary="Total a pagar al profesor" secondary={`${professor.result.collectedByProfessor}$`} />
            </ListItem>
            <ListItem>
                <ListItemIcon className="text-yellow-900">
                    <PercentIcon/>
                </ListItemIcon>
                <ListItemText primary="Criterio" secondary={criteria} />
            </ListItem>
            <div className="mt-2 md:mt-4 md:flex md:flex-row justify-center gap-12">
                <ButtonPrimary disabled={alreadyInformedPayment()} onClick={handleInform}>Informar</ButtonPrimary>
                <ButtonPrimary onClick={() => onShowPayments(professor.result.payments)}>Ver pagos</ButtonPrimary>
            </div>
        </List>
        <AddProfessorPaymentModal criteriaType={professor.result.period.criteria} totalStudents={professor.result.totalStudents} criteria={criteria} criteriaValue={professor.result.period.criteriaValue} period={period} total={professor.result.collectedByProfessor} payments={professor.result.payments} addPayment={addPayment} isOpen={isModalOpen} onClose={toggleModal} professorName={professor.name}/>
    </Collapse>
    </>);
} 