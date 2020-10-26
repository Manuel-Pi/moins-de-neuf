let TOKEN: any = null;

const basicRequest = (url: string, options: any = {}) => {
    // Add token if exist
    const authToken = Rest.getAuthorization();
    if(authToken) options.headers = new Headers({...options.headers, Authorization: authToken});
    let fullUrl = "/pizi-rest/" + url;
    if(options.query) fullUrl += "?" + new URLSearchParams(options.query).toString();
    return fetch(fullUrl, options).then(response => response.json());
}

export const Rest = {
    get(url: string, options?: any){
        return basicRequest(url, options)
    },
    post(url: string, data: any, options?: any){
        return basicRequest(url, {
            ...options,
            method: "POST"
        })
    },
    // TOKEN utilities
    getToken(login: string, password: string){
        return this.post("token", null, {
            headers: {login, password}
        }).then((token: any) => {
            if(token.jwt){
                TOKEN = token;
                localStorage.setItem("token", JSON.stringify(TOKEN))
            }
            return token
        })
    },
    checkToken(){
        TOKEN = TOKEN || JSON.parse(localStorage.getItem("token")) || null;
        return this.post("check").then((response:any) => {
            if(response.message){
                this.clearToken();
            } else {
                TOKEN = response;
                localStorage.setItem("token", JSON.stringify(TOKEN));
                return TOKEN;
            }
        })
    },
    clearToken(){
        TOKEN = {};
        localStorage.removeItem("token");
    },
    getAuthorization(){
        TOKEN = TOKEN || JSON.parse(localStorage.getItem("token")) || null;
        return (TOKEN && TOKEN.jwt) ? "Bearer " + TOKEN.jwt : null
    }
}