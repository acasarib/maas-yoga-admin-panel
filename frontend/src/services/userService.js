import axios from "axios";

export default {
    authUser(userBody) {
        return new Promise((resolve, reject) => {
            axios
                .post(process.env.BACKEND_HOST, userBody)
                .then((response) => {
                    resolve(response.data.token);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    }
};

