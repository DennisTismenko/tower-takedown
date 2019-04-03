import Rest from './api';
const HOST = "https://server.towertakedowngame.com"; // PROD
// const HOST = "http://localhost:8081"; // DEV

export default {
    register: (email, password) => {
        return new Promise((resolve, reject) => {
            Rest.request(`${HOST}/users/register`, 'POST', { email, password })
            .then(res => resolve(res))
            .catch(res => reject(res));
        });  
    },
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            Rest.request(`${HOST}/users/login`, 'POST', { email, password })
            .then(res => resolve(res))
            .catch(res => reject(res));
        });
        
    },
    logout: () => {
        return new Promise((resolve, reject) => {
            Rest.request(`${HOST}/users/logout`,'GET')
            .then(res => resolve(res))
            .catch(res => reject(res));
        });
    },
    verifyAuth: () => {
        return new Promise((resolve, reject) => {
            Rest.request(`${HOST}/users/isAuthenticated`, 'GET')
            .then(res => resolve(res))
            .catch(res => reject(res));
        });
    }
}
