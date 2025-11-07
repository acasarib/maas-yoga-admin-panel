import React, { useState, useEffect } from 'react';
import styles from "./weekday.module.css";
import { getPrettyClassDaysString, twoDigits } from '../../utils';
import * as dayjs from 'dayjs'
import Label from '../label/label';
import TimeInput from '../calendar/timeInput';

export default function WeekdayPicker({ days, setDays }) {
  const [lastSelectedDay, setLastSelectedDay] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  
  const handleClick = (day, e) => {
    e.preventDefault()
    setDays(current => current.map(d => {
      if (d.key === day.key) {
        d.isSelected = !d.isSelected;
        d.startAt = null;
        d.endAt = null;
        if (d.isSelected) {
          if (lastSelectedDay !== null) {
            d.startAt = lastSelectedDay.startAt;
            d.endAt = lastSelectedDay.endAt;
          }
          setLastSelectedDay(d);
        } else {
          const anyRemainingDay = days.find(day2 => day2.isSelected && day2.startAt === null);
          setLastSelectedDay(anyRemainingDay ? anyRemainingDay : null);
        }
      }
      return d;
    }));
  }

  const handleChangeTime = (newValue, startOrEnd) => {
    setDays(current => current.map(d => {
      if (d.key === lastSelectedDay.key) {
        d[startOrEnd] = parseTimeToString(newValue);
      }
      return d;
    }));
  }

  const parseTimeToString = date => {
    if (date === null )
      return null
    else 
      return `${twoDigits(date.hour())}:${twoDigits(date.minute())}`
  };

  const parseTimeToDayJs = string => string === null ? null : dayjs({ hour:parseInt(string.split(":")[0]), minute:parseInt(string.split(":")[1]) });

  useEffect(() => {
    const validDays = days.filter(d => d.isSelected && d.startAt !== null && d.endAt !== null);
    setSelectedDays(validDays ? validDays.map(d => ({ ...d, startAt: d.startAt, endAt: d.endAt })) : []);
  }, [days]);

  return (
    <div>
      <div className='flex justify-between w-full'>
        {days.map(day => 
          <button key={day.key} onClick={(e) => handleClick(day, e)} className={`${styles.button}`}>
            <div className={`${styles.textContainer} ${day.isSelected && styles.buttonSelected}`}>
              <span className='font-bold'>{day.label}</span>
              {(day.startAt !== null && day.endAt !== null) && (<div className='hidden sm:flex flex-col text-xs hidden'><span>{day.startAt}</span><span>{day.endAt}</span></div>)}
            </div>
          </button>
        )}
      </div>
      {lastSelectedDay !== null &&
        <div>
          <h2 className="text-xl md:text-2xl text-center mb-2 sm:mb-4">{lastSelectedDay.completeLabel}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div className='flex flex-col'>
              <Label htmlFor='start-at-date-time'>Empieza</Label>
              <TimeInput
                name="start-at-date-time"
                value={parseTimeToDayJs(lastSelectedDay.startAt)}
                onChange={(newValue) => handleChangeTime(newValue, "startAt")}
              />
            </div>
            <div className='flex flex-col'>
              <Label htmlFor='end-at-date-time'>Termina</Label>
              <TimeInput
                name="end-at-date-time"
                value={parseTimeToDayJs(lastSelectedDay.endAt)}
                onChange={(newValue) => handleChangeTime(newValue, "endAt")}
              />
            </div>
          </div>
        </div>
      }
      {selectedDays.length > 0 && 
        <div className='mt-4 helper-text'>
          {getPrettyClassDaysString(selectedDays)}
        </div>
      }
    </div>
  );
}