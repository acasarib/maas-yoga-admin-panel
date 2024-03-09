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

  getMonthlyDateSeries(fromDate, toDate) {
    const dateSeries = [];
    let currentDate = new Date(fromDate);
  
    while (currentDate <= toDate) {
      dateSeries.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  
    return dateSeries;
  }
};
