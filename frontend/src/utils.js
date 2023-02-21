export function capitalizeFirstCharacter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function formatDateDDMMYY(date) {
    return `${date.getDate()}/${date.getMonth() +1}/${date.getFullYear()}`;
}