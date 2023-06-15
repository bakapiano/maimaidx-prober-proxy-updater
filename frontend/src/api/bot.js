import httpRequest from '../request/index'

async function callBot(username, password, friendCode) {
  return await httpRequest.post('/bot', { username, password, friendCode })
}

export { callBot }
