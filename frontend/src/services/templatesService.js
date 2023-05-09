import axios from './interceptors';

export default {
    newTemplate(templateData) {
        return new Promise((resolve, reject) => {
            const data = {
                "title": templateData.title,
                "content": templateData.content
            }        
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .post(baseUrl + 'api/v1/templates', data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getTemplates() {
        return new Promise((resolve, reject) => {      
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + 'api/v1/templates', {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    getTemplate(templateId) {
        return new Promise((resolve, reject) => {      
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .get(baseUrl + `api/v1/templates/${templateId}`, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
    updateTemplate(templateId, templateData) {
        return new Promise((resolve, reject) => {      
            const data = {
                "title": templateData.title,
                "content": templateData.content
            }  
            const baseUrl = process.env.REACT_APP_BACKEND_HOST;
            axios
                .put(baseUrl + `api/v1/templates/${templateId}`, data, {})
                .then((response) => {
                    resolve(response.data);
                })
                .catch((error) => {
                    reject(error.data)
                })
        });
    },
};

