import httpRequest from "../request/index"

async function postForm(username, password) {
    const successPageUrl = window.location.href + "#Success"
    const result = await httpRequest.post("/auth", {username, password, successPageUrl})
    return result
}

export {
    postForm
}