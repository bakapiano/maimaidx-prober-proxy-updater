import httpRequest from '../request/index'

async function postForm(username, password, type, allDiff) {
  const callbackHost = window.location.host
  const result = await httpRequest.post('/auth', {
    username,
    password,
    callbackHost,
    type,
    allDiff,
  })
  return result
}

export { postForm }
