class Cookies{
    constructor(){
        this.load()
    }

    get(cookie){
        this.load()
        return this.cookieObject[cookie]
    }

    set(cookie, value){
        this.cookieObject[cookie] = value
        document.cookie = `${cookie}=${value}`
        this.load()
    }

    load(){
        this.cookieString = document.cookie;
        var temp = this.cookieString.split("; ")
        this.cookieObject = {}
        for(let i in temp){
            i = temp[i];
            var [name, value] = i.split("=")
            this.cookieObject[name] = value;
        }
        
    }

    clear(){
        
    }
}

export default Cookies;