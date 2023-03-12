import httpRequest from "../request/index";

async function getTrace(uuid) {
  return await httpRequest.get("/trace", { params: { uuid } });
}

export { getTrace };
