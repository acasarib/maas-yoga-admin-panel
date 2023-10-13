import React, { useContext, useEffect } from "react";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import "moment/locale/es";
import moment from 'moment';
import { Context } from "../../context/Context";
import { useState } from "react";
import { randomColor } from "../../utils";
import { formatDateDDMMYY } from "../../utils";

const localizer = momentLocalizer(moment);

export default function CourseCalendar({ course }) {
    const { getProfessorById, professors } = useContext(Context);
    const [parsedPeriods, setParsedPeriods] = useState([]);
    const professorColors =      ["#B1DDF1", "#9F87AF", "#EE6C4D", "#5EF38C", "#08415C"];
    const professorTextColors =  ["#000000", "#000000", "#000000", "#000000", "#FFFFFF"];

    const mapPeriod = (period, index) => {
        const professorPeriod = getProfessorById(period.professorId);
        let bgColor = professorColors[index];
        let textColor = professorTextColors[index];
        if (bgColor === undefined) {
            bgColor = randomColor();
            textColor = "#000000";
        }
        const [startYear, startMonth, startDay] = period.startAt.split("-");
        const startAt = new Date(parseInt(startYear), parseInt(startMonth)-1, parseInt(startDay));
        const [endYear, endMonth, endDay] = period.endAt.split("-");
        const endAt = new Date(parseInt(endYear), parseInt(endMonth)-1, parseInt(endDay), 1)
        return {
            title: professorPeriod.name + " " + professorPeriod.lastName,
            professor: professorPeriod,
            start: startAt,
            end: endAt,
            hexColor: bgColor,
            textColor: textColor,
        }
    }

    const eventStyleGetter = function(event, start, end, isSelected) {
        const style = {
            backgroundColor: event.hexColor,
            color: event.textColor,
        };
        return {
            style: style
        };
    }

    useEffect(() => {
        if (professors.length === 0)
            return
        setParsedPeriods(course.periods.map(mapPeriod));
    }, [course, professors]);

    const translatedMessages = {
        date: "Fecha",
        time: "Hora",
        event: "Evento",
        allDay: "Todo el dia",
        week: "Semana",
        work_week: "Semana de trabajo",
        day: "Dia",
        month: "Mes",
        previous: "Anterior",
        next: "Siguiente",
        yesterday: "Ayer",
        tomorrow: "Mañana",
        today: "Hoy",
        agenda: "Agenda",
        showMore: (amount) => `Mostrar ${amount} mas`,
        noEventsInRange: "No hay eventos en este rango",
    }

    return (<>
        <div className="flex flex-col my-4">
            {parsedPeriods.map(period => (<div className="flex items-center">
                <div style={{height: "16px", width: "16px", backgroundColor: period.hexColor, borderRadius: "6px"}}></div>
                <div className="ml-1">{`${formatDateDDMMYY(period.start)} - ${formatDateDDMMYY(period.end)}`}</div>
                <div className="ml-1 font-bold">{period.professor.name + " " + period.professor.lastName}</div>
            </div>))}
        </div>
        <Calendar
            localizer={localizer}
            showMultiDayTimes={true}
            events={parsedPeriods}
            views={["month", "week"]}
            style={{ height: 500 }}
            culture={"es"}
            messages={translatedMessages}
            eventPropGetter={(eventStyleGetter)}
        />
    </>);
}