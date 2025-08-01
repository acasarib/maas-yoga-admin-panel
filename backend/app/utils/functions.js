export default {
  removeDuplicated(array) {
    const result = array.filter((value, index, self) => {
      return self.indexOf(value) === index;
    });
    
    return result;
  },

  dateToYYYYMMDD(date) {
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
  },
  
  dateToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  },

  fromDDMMYYYYStringToDate(date) {
    if (!date) return null;
    const dateParts = date.split("/");
    if (dateParts.length !== 3 || dateParts[2].length !== 4) return null;
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10);
    const year = parseInt(dateParts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month - 1, day);
    } else {
      return null;
    }
  },

  /**
   * 
   * @param {Date} fromDate 
   * @param {Date} toDate 
   * @returns Array<Date>
   */
  getMonthlyDateSeries(fromDate, toDate) {
    const dateSeries = [];
    let currentDate = new Date(fromDate);
  
    while (currentDate <= toDate) {
      dateSeries.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    return dateSeries;
  },

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
  series(from, to) {
    if (from.length == 10) {
      from = from + "T00:00:00";
    }
    if (to.length == 10) {
      to = to + "T23:59:59";
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
  },

  isNumber(value) {
    return (typeof value === 'number' || typeof value === 'string') && !isNaN(Number(value));
  },

  isDateBetween(dateToCheck, startDate, endDate) {
    const check = new Date(dateToCheck).getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return check >= start && check <= end;
  },

  parseDateFromStringYYYYMMDD(dateString) {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  },

  capitalizeString(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

};
