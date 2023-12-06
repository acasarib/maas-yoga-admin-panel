export default {
    async getLocations() {
        const baseUrl = process.env.REACT_APP_DIARY_BACKEND_HOST;
        const response = await fetch(baseUrl + "searchLocation", {
            method: 'POST',
            body: JSON.stringify({"string":"","filters":{},"limit":25,"offset":0})
        });
        return response.json()
    },
    async getCash(year, month, location) {
        const baseUrl = process.env.REACT_APP_DIARY_BACKEND_HOST;
        const body = {
            year,
            month,
            limit: 25,
            offset: 0,
            indexed: 1,
            id_usuario: null,
            all: null,
        }
        if (location != null)
            body.id_location = parseInt(location);
        const response = await fetch(baseUrl + "getCash", {
            method: 'POST',
            body: JSON.stringify(body)
        });
        const json = await response.json()
        return json.cash
    },
};

