
export default {
    getUsers(limit, offset, idState) {
        return new Promise((resolve, reject) => {
            const data = {
                "string": null,
                "id_estado": idState,
                "id_permiso": "3",
                "id_cuota": null,
                "indexed_user": null,
                "limit": limit,
                "offset": offset
            }
            const baseUrl = process.env.REACT_APP_DIARY_BACKEND_HOST;
            fetch(baseUrl + 'search', {method: 'POST', body: JSON.stringify(data)})
                .then(response => response.json())
                .then(data => resolve(data))
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

