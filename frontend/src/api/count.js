import httpRequest from "../request/index"

async function getCount() {
    return await httpRequest.get("/count")
}

export {
    getCount
}