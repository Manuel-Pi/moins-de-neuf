let TOKEN: any = null;

const getAuthorization = () => {
    TOKEN = TOKEN || JSON.parse(localStorage.getItem("token")) || null;
    return (TOKEN && TOKEN.jwt) ? "Bearer " + TOKEN.jwt : null
}

const basicRequest = (url: string, options: any = {}) => {
    // Add token if exist
    const authToken = getAuthorization()
    if(authToken) options.headers = new Headers({...options.headers, Authorization: authToken})
    let fullUrl = url.startsWith("/") ? url : "/pizi-rest/" + url
    if(options.query) fullUrl += "?" + new URLSearchParams(options.query).toString()
    return fetch(fullUrl, options).then(response => {
        if(!response.ok) throw Error("500")
        return response && response.json()
    })
}

export const PiziRest = {
    get(url: string, options?: any){
        return basicRequest(url, options)
    },
    post(url: string, data: any, options?: any){
        return basicRequest(url, {
            ...options,
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(data),
            method: "POST"
        })
    },
    put(url: string, data: any, options?: any){
        return basicRequest(url, {
            ...options,
            headers: {
                'Content-Type':'application/json'
            },
            method: "PUT",
            body: JSON.stringify(data)
        })
    },
    delete(url: string, data: any, options?: any){
        return basicRequest(url, {
            ...options,
            headers: {
                'Content-Type':'application/json'
            },
            method: "DELETE",
            body: JSON.stringify(data)
        })
    }
}

export const PiziToken = {
    // TOKEN utilities
    getToken(login: string, password: string){
        return PiziRest.get("/token", {
            headers: {login, password}
        }).then((token: any) => {
            if(token && token.jwt){
                TOKEN = token;
                localStorage.setItem("token", JSON.stringify(TOKEN))
            }
            return token
        }).catch((error:any) => console.error(error))
    },
    checkToken(){
        TOKEN = TOKEN || JSON.parse(localStorage.getItem("token")) || null;
        return PiziRest.get("/check").then((response:any) => {
            if(!response) return
            if(response.message){
                this.clearToken()
            } else {
                TOKEN = response;
                localStorage.setItem("token", JSON.stringify(TOKEN))
                return TOKEN
            }
        })
    },
    clearToken(){
        TOKEN = {};
        localStorage.removeItem("token");
    }
}

export const PiziUsers = {
    getUser(login: string){
        return PiziRest.get("/pizi-users/getUser/" + login)
    },
    updateUser(login: string, userProps: {[key: string]: any}){
        return PiziRest.put("/pizi-users/updateUser/" + login, userProps)
    },
    createUser(userProps: {login: string, password?: string, email?: string, checkCode?: string}){
        return PiziRest.post("/pizi-users/createUser", userProps)
    },
    deleteUser(login: string, userProps: {checkPassword: string}){
        return PiziRest.delete("/pizi-users/deleteUser/" + login, userProps)
    }
}

export const PiziEmail = {
    sendEmail(email: any){
        return PiziRest.post("/pizi-pizi-email/sendEmail", email)
    }
}