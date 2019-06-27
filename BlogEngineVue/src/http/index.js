function createXHR()
{
    try { return new XMLHttpRequest(); } catch(e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e) {}
    try { return new ActiveXObject("Microsoft.XMLHTTP"); } catch (e) {}
    return null;
}

function request(requestObject){
    return new Promise((resolve, reject) => {
        var xhr = createXHR();
        xhr.xml  = () => xhr.responseXML
        xhr.json = () => JSON.parse(xhr.responseText)
        xhr.aborted = false
        xhr.open(requestObject.method || "GET", requestObject.url)
        for(let header in requestObject.headers){
            xhr.setRequestHeader(header, requestObject.headers[header])
        }
        xhr.setRequestHeader("cache-control", "no-cache")
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

export default {request, createXHR}