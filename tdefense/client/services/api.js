export default class RestAPI {
    static request(path, method, body) {
        return new Promise((resolve, reject) => {
            fetch(path, {
                method,
                mode: 'cors',
                credentials: 'include',
                headers: new Headers({
                    'Content-Type': 'application/json'
                }),
                body: body ? JSON.stringify(body) : undefined
            })
            .then(res => {
                if (res.ok) {
                    resolve(res.json());
                } else {
                    reject(res);
                }
            })

        });
    }
}