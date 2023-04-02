import httpRequest from '../request/index'

const proberBase = 'https://www.diving-fish.com'

async function getMusicData() {
  return await httpRequest.get(`${proberBase}/api/maimaidxprober/music_data`)
}

async function getTestData() {
  return await httpRequest.get(
    `${proberBase}/api/maimaidxprober/player/test_data`
  )
}

async function getPlayerData(data) {
  if (!data.qq && !data.username) throw Error("QQ and username can't be empty")
  if (!data.qq) delete data.qq
  if (!data.username) delete data.username
  return await httpRequest.post(
    `${proberBase}/api/maimaidxprober/query/player`,
    data
  )
}

export { getMusicData, getPlayerData, getTestData }
