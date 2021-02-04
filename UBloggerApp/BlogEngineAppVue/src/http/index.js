export default class Http {
    constructor(global){
        this.headers = global.headers
        this.base = global.base || ""
        if(this.base.length > 0){
            if(this.base.lastIndexOf("/") != this.base.length - 1){
                this.base += "/"
            }
        }
    }
    createXHR(method, url){
        var xhr = null;
        try { xhr = new XMLHttpRequest(); } catch(e) {}
        try { xhr = new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
        try { xhr = new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
        try { xhr = new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
        try { xhr = new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
        if(xhr){
            xhr.open(method || "GET", `${this.base + url}`)
            xhr.xml  = () => xhr.responseXML
            xhr.json = () => JSON.parse(xhr.responseText)
            xhr.aborted = () => reject("Request aborted")
            for(let header in this.headers){
                xhr.setRequestHeader(header, this.headers[header].constructor == Function? this.headers[header]() : this.headers[header])
            }
        }
        return xhr;
    }
    request(requestObject){
        return new Promise((resolve, reject) => {
            var xhr = this.createXHR(requestObject.method, requestObject.url);
            for(let header in requestObject.headers){
                xhr.setRequestHeader(header, requestObject.headers[header].constructor == Function? requestObject.headers[header]() : requestObject.headers[header])
            }
            if(!requestObject.cors){
                xhr.setRequestHeader("cache-control", "no-cache")
            }
            xhr.timeout = requestObject.timeout || 15000;
            xhr.ontimeout = () => {
                xhr.abort()
                return reject("The connection timed out. Please try again.")
            }
            xhr.onerror = (e) => {
                console.error(e)
                return reject("An Error occured!" + e)
            }
            try{
                xhr.send(requestObject.content)
            } catch(e){
                console.error(e)
                reject("Request failed! " + e)
            }
            xhr.onload = () => resolve(xhr)
        })
    }
}
