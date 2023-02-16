import httpRequest from "../request/index"

async function postForm(username, password, type) {
    const successPageUrl = window.location.href + "#Success"
    const result = await httpRequest.post("/auth", {username, password, successPageUrl, type})
    return result
}

export {
    postForm
}