export function capitalizeFirstCharacter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatDateDDMMYY(date) {
    return `${date.getDate()}/${date.getMonth() +1}/${date.getFullYear()}`;
}

export function dateDiffInDays(date1, date2) {
    const diff = date1.getTime() - date2.getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days;
  }