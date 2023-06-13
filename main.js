import { cancelFriendRequest, getFriendList, getSentRequests, sendFriendRequest, testCookieExpired } from "./src/bot.js"
import { clearExpireData, saveCount } from "./src/db.js"
import {loadCookie, refreshCookie} from "./src/wechat.js"

import { CookieJar } from "node-fetch-cookies"
import config from "./config.js"
import fs from "fs"
import { proxy } from "./src/proxy.js"
import schedule from "node-schedule"
import { server } from "./src/server.js"

if (config.httpServer.enable) {
  server.listen(config.httpServer.port)
  server.on("error", (error) => console.log(`Server error ${error}`))
  console.log(`HTTP server listen on ${config.httpServer.port}`)
}

if (config.httpProxy.enable) {
  proxy.listen(config.httpProxy.port)
  proxy.on("error", (error) => console.log(`Proxy error ${error}`))
  console.log(`Proxy server listen on ${config.httpProxy.port}`);
}


// Create a schedule to clear in-memory DB and save count
const rule = new schedule.RecurrenceRule()
rule.minute = []
for (var min = 0; min < 60; min += 5) {
  rule.minute.push(min)
}
schedule.scheduleJob(rule, async () => {
  try {
    console.log(`Clear in-memory DB and save count...`)
    await saveCount()
    await clearExpireData()
  } 
  catch (err) {
    console.error(err)
  }
})