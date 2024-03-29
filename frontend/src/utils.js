export function capitalizeFirstCharacter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getMonthNames() {
    return [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
}

/**
 * 
 * @param {String} from 
 * @param {String} to 
 * @returns {Array<Date>} series between from and to
 * Example:
 * 
 * Input:
 * from="2024-01-01"
 * to="2024-03-31"
 * 
 * Output:
 * [Date("2024-01-01"), Date("2024-02-01"), Date("2024-03-01")]
 */
export function series(from, to) {
    if (from.length == 10) {
        from = from + "T00:00:00"
    }
    if (to.length == 10) {
        to = to + "T23:59:59"
    }
    from = new Date(from);
    to = new Date(to);
    function getFirstDayDateOfMonth(date) {
        return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    let serieDates = [];
    serieDates.push(getFirstDayDateOfMonth(from));
    while (from < to) {
        from.setMonth(from.getMonth() + 1);
        serieDates.push(getFirstDayDateOfMonth(from));
    }
    serieDates.pop();
    return serieDates;
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatDateDDMMYY(date) {
    try {
        if (typeof date == "string")
            date = new Date(date);
        let day = date.getDate();
        let month = date.getMonth() +1;
        if (day < 10)
            day = "0" + day
        if (month < 10)
            month = "0" + month;
        return `${day}/${month}/${date.getFullYear()}`;
    } catch (e) {
        return "Fecha invalida";
    }
}

export function withSeparators(number) {
    try {
        if (typeof number === 'string')
        number = parseFloat(number);
        return number.toLocaleString('es-ES');
    } catch {
        return number;
    }
}

export function dateDiffInDays(date1, date2) {
    const diff = date1.getTime() - date2.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
}

export function dateToString(str) {
    if (str === null || str === undefined)
        return "Sin fecha/Fecha invalida";
    const dt = typeof str === 'string' ? new Date(str) : str;
    const year  = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, "0");
    const day   = dt.getDate().toString().padStart(2, "0");
    const hour  = dt.getHours();
    const mins  = String(dt.getMinutes()).padStart(2, '0'); 
    const date = `${day}/${month}/${year} ${hour}:${mins}`;
    return date;
}

export function formatPaymentValue(value) {
    return "$" + value.toLocaleString("es-ES");
}

export function isByStudent(criteria) {
    return criteria.split("-")[0] === "student"
}

export function isByPercentage(criteria) {
    return criteria.split("-")[0] === "percentage"
}

export function isByAssistance(criteria) {
    return criteria.split("-")[1] === "assistance"
}

export function twoDigits(minutes) {
    return String(minutes).padStart(2, '0');
}

export function getPrettyClassDaysString(days) {
    if (days.length === 1) {
        return `${capitalizeFirstCharacter(keyDayToPrettyDay(days[0].key))} de ${days[0].startAt} a ${days[0].endAt}`;
    } else if (days.length > 0) {
        const equalsDaysTimes = {};
        days.forEach(day => {
          const key = `${day.startAt}${day.endAt}`;
          if (key in equalsDaysTimes) {
            equalsDaysTimes[key].push(day);
          } else {
            equalsDaysTimes[key] = [day];
          }
        });
        return capitalizeFirstCharacter(Object.values(equalsDaysTimes)
                .map(daysMatch => `${daysMatch.map(d => keyDayToPrettyDay(d.key))
                .join(" y ")} de ${daysMatch[0].startAt} a ${daysMatch[0].endAt}`)
                .join(", "));
    }
    return "";
}

function keyDayToPrettyDay(key) {
    switch (key) {
        case "mon": return "lunes";
        case "tue": return "martes";
        case "wed": return "miercoles";
        case "thu": return "jueves";
        case "fri": return "viernes";
        case "sat": return "sabado";
        case "sun": return "domingo";
        default: return "fecha invalida";
    }
}

export function dateToYYYYMMDD(date) {
    if (typeof date == "string")
        date = new Date(date);
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    if (month < 10) {
      month = '0' + month;
    }
    let day = date.getDate();
    if (day < 10) {
      day = '0' + day;
    }
    return year + '-' + month + '-' + day;
}

export function splitDate(date) {
    const [fromYear, fromMonth, fromDay] = date.split("-");
    date = new Date(fromYear, fromMonth -1, fromDay);
    return date;
}

export function toMonthsNames(from, to) {
    if (typeof from === "string" && from.includes("-") && from.length === 10) {
        const [fromYear, fromMonth, fromDay] = from.split("-");
        const [toYear, toMonth, toDay] = to.split("-");
        from = new Date(fromYear, fromMonth -1, fromDay);
        to = new Date(toYear, toMonth -1, toDay);
    } else {
        from = new Date(from);
        to = new Date(to);
    }
    const diffMiliseconds = Math.abs(from - to);
    const milisecondsPerDay = 1000 * 60 * 60 * 24;
    const diffInDays = Math.floor(diffMiliseconds / milisecondsPerDay);
    const format = (from, to) => `${from} - ${to}`;
    if (diffInDays < 365 && isFirstDayOfMonth(from) && isLastDayOfMonth(to)) {
        const fromMonth = getMonthName(from);
        const toMonth = getMonthName(to);
        return fromMonth === toMonth ? fromMonth : format(fromMonth, toMonth)
    } else {
        return format(formatDateDDMMYY(from), formatDateDDMMYY(to));
    }
}

export function addLeadingZeroLessTen(numberString) {
    const number = parseInt(numberString, 10);
    if (number < 10) {
      return '0' + number;
    }
    return numberString;
}

export function getLastDayOfMonth(year, month) {
    const nextMonth = new Date(year, month, 1);
    nextMonth.setHours(-1);
    return nextMonth.getDate();
}

export function randomColor() {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');
    const colorHex = `#${redHex}${greenHex}${blueHex}`;
  
    return colorHex;
}

function isFirstDayOfMonth(date) {
    return date.getDate() === 1;
}

function isLastDayOfMonth(date) {
    const day = date.getDate();
    const month = date.getMonth();
    const nextDay = new Date(date);
    nextDay.setDate(day + 1);
    return nextDay.getMonth() !== month;
}

export function getMonthName(date) {
    const options = { month: 'long' };
    return date.toLocaleDateString('es-ES', options);
}

export function getMonthNameByMonthNumber(monthNumber) {
    const year = new Date().getFullYear();
    const date = new Date(year, monthNumber - 1); 
    date.setDate(monthNumber);
    return getMonthName(date)
}