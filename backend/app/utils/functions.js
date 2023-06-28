export default {
    removeDuplicated(array) {
        const result = array.filter((value, index, self) => {
          return self.indexOf(value) === index;
        });
        
        return result;
      }
};
