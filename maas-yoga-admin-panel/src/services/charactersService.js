import axios from "axios";

export function getCharacters() {
   
        return new Promise((resolve, reject) => {
            axios.get('https://swapi.dev/api/people/')
            .then((response) => {
                resolve(response.data.results);
                const data = response.data.results;
                localStorage.setItem('starWarsCharacters', JSON.stringify(data));
            })
            .catch((err) => {
                reject(err.data);
            });
        });
    
}