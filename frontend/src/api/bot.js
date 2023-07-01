import httpRequest from '../request/index'

async function postBotForm(username, password, friendCode) {
  return await httpRequest.post('/bot', { username, password, friendCode })
}

export { postBotForm }
