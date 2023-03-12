import httpRequest from "../request/index"

async function postForm(username, password, type) {
    const callbackHost = window.location.host
    const result = await httpRequest.post("/auth", {username, password, callbackHost, type})
    return result
}

export {
    postForm
}